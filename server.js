const express = require("express");
const bodyParser = require('body-parser')
const cors = require("cors");
const app = express();
const jsonParser = bodyParser.json()

var corsOptions = {
	origin: "http://localhost:3000" // URL of the frontend
};

app.use(cors(corsOptions));
app.use(express.json()); // parsing application/json
app.use(express.urlencoded({ extended: true })); // parsing application/x-www-form-urlencodedconst
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:')

const Employee = sequelize.define("employee", {
	firstName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	lastName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	department: {
		type: DataTypes.STRING,
		allowNull: false
	}
	//	department:{
	//	type: DataTypes.ENUM,
	//	values: [],
	//	allowNull: false
	//	}
});

const Task = sequelize.define("task", {
	user: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	userName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	description: {
		type: DataTypes.STRING,
		allowNull: false
	},
	priority: {
		type: DataTypes.STRING,
		allowNull: false
	},
	completion: {
		type: DataTypes.STRING,
		allowNull: false
	}
});
(async () => {
	await sequelize.sync({ force: true })
})();

var router = express.Router();
router.get("/employees/", async (req, res) => {
	const employees = await Employee.findAll();
	res.send(employees);
});
router.put("/employees/add", jsonParser, async (req, res) => {
	const { firstName, lastName, department } = req.body;
	const employee = Employee.build({ firstName: firstName, lastName: lastName, department: department })
	await employee.save();
});
router.get("/employees/view/:id", async (req, res) => {
	id = req.params.id;
	const employees = await Employee.findAll({ where: { id: id } });
	const employee = employees[0];
	res.send(employee);
});
router.put("/employees/edit/:id", async (req, res) => {
	id = req.params.id;
	const { firstName, lastName, department } = req.body;
	const employees = await Employee.findAll({ where: { id: id } });
	const employee = employees[0];
	const tasks = await Task.findAll({ where: { user: id } });
	for (let i = 0; i < tasks.length; i++) {
		tasks[i].userName = firstName + " " + lastName;
		tasks[i].save();
	}
	employee.firstName = firstName;
	employee.lastName = lastName;
	employee.department = department;
	await employee.save();
});
router.delete("/employees/delete/:id", async (req, res) => {
	id = req.params.id;
	const tasks = await Task.findAll({ where: { user: id } });
	for (let i = 0; i < tasks.length; i++) {
		tasks[i].user = 0;
		tasks[i].userName = "Unassigned";
		tasks[i].save();
	}
	Employee.destroy({ where: { id: id } });
});

router.get("/tasks", async (req, res) => {
	const tasks = await Task.findAll();
	res.send(tasks);
});
router.put("/tasks/add", async (req, res) => {
	const { user, description, priority, completion } = req.body;
	if (user == 0)
		userName = "Unassigned";
	else {
		const employees = await Employee.findAll({ what: { id: user } });
		const employee = employees[0];
		userName = employee.firstName + " " + employee.lastName;
	}
	const task = Task.build({ user: user, userName: userName, description: description, priority: priority, completion: completion });
	await task.save();
});
router.get("/tasks/view/:id", async (req, res) => {
	id = req.params.id;
	const tasks = await Task.findAll({ where: { id: id } })
	const task = tasks[0];
	res.send(task);
});
router.put("/tasks/edit/:id", async (req, res) => {
	id = req.params.id;
	const { user, description, priority, completion } = req.body;
	var userName;
	if (user == 0)
		userName = "Unassigned";
	else {
		const employees = await Employee.findAll({ what: { id: user } });
		const employee = employees[0];
		userName = employee.firstName + " " + employee.lastName;
	}
	const tasks = await Task.findAll({ where: { id: id } })
	const task = tasks[0];
	task.user = user;
	task.userName = userName;
	task.description = description;
	task.priority = priority;
	task.completion = completion;
	await task.save();
});
router.delete("/tasks/delete/:id", (req, res) => {
	id = req.params.id;
	Task.destroy({ where: { id: id } });
});
router.get("/tasks/:id", async (req, res) => {
	id = req.params.id;
	const tasks = await Task.findAll({ where: { user: id } });
	res.send(tasks);
});
app.use('', router);
PORT = process.env.PORT || 8080; // Port

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});