process.env.NODE_ENV = "test";

const models = require("../models");
const { assert } = require("chai");

describe("Project", () => {
  const projectName = "Project Name";
  const newName = "New Project Name";
  beforeEach(async () => {
    await models.sequelize.sync({ force: true });
  });

  it("creates a project", async () => {
    const project = await models.Project.create({ name: projectName });

    assert(project.id === 1);
    assert(
      project.name === projectName,
      `Project name does not match ${projectName}`
    );
  });
  it("destructures properties out of the model", async () => {
    await models.Project.create({ name: projectName });

    const { name } = await models.Project.findOne({ where: { id: 1 } });

    assert(name === projectName);
  });
  it("updates the project name", async () => {
    await models.Project.create({ name: projectName });

    let project = await models.Project.findOne({ where: { id: 1 } });

    assert(project.name === projectName);

    project.name = newName;
    await project.save();

    project = await models.Project.findOne({ where: { id: 1 } });

    assert(project.name === newName);
  });
  it("does not allow duplicate project names", async () => {
    await models.Project.create({ name: projectName });
    try {
      await models.Project.create({ name: projectName });
    } catch (e) {
      return assert(e !== null);
    }
    assert.fail(`Project with duplicate name created`);
  });
});
