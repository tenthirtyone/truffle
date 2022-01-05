process.env.NODE_ENV = "test";

const models = require("../models");
const { assert } = require("chai");

describe("Contract", () => {
  describe("Project", () => {
    const name = "Project Name";
    const newName = "New Project Name";
    beforeEach(async () => {
      await models.sequelize.sync({ force: true });
    });

    it("creates a project", async () => {
      const project = await models.Project.create({ name });

      assert(project.id === 1);
      assert(project.name === name, `Project name does not match ${name}`);
    });
    it("updates the project name", async () => {
      await models.Project.create({ name });

      let project = await models.Project.findOne({ where: { id: 1 } });

      assert(project.name === name);

      project.name = newName;
      await project.save();

      project = await models.Project.findOne({ where: { id: 1 } });

      assert(project.name === newName);
    });
    it("does not allow duplicate project names", async () => {
      await models.Project.create({ name });
      try {
        await models.Project.create({ name });
      } catch (e) {
        return assert(e !== null);
      }
      assert.fail(`Project with duplicate name created`);
    });
  });
});
