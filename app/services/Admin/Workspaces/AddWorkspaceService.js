const Users = require("../../../models/Users");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  ownerUserId: "required|integer",
  creatorUserId: "required|integer",
  name: "required|string",
  spaceCharacter:
    "present|in:'Blank Space','Nothing','Plus','Hypen','Underscore'",
  description: "present|string",
};

const errors = {
  1: {
    code: "ERR-ADDWORKSPACE-01",
    message: "Owner or creator does not exist.",
  },
  2: {
    code: "ERR-ADDWORKSPACE-02",
    message: "Workspace already exists.",
  },
  3: {
    code: "ERR-ADDWORKSPACE-03",
    message: "Unable to create workspace record.",
  },
};

const addWorkspace = async body => {
  const { ownerUserId, creatorUserId, name, spaceCharacter, description } =
    body;

  let user = await Users.query().select("id").findById(ownerUserId);
  if (!user) {
    return { error: errors[1] };
  }

  user = await Users.query().select("id").findById(creatorUserId);
  if (!user) {
    return { error: errors[1] };
  }

  const existingWorkspace = await Workspaces.query()
    .select("id")
    .where("owner_user_id", ownerUserId)
    .where("name", name)
    .first();
  if (existingWorkspace) {
    return { error: errors[2] };
  }

  const newWorkspace = await Workspaces.query().insertAndFetch({
    owner_user_id: ownerUserId,
    creator_user_id: creatorUserId,
    name,
    description: spaceCharacter
      ? spaceCharacter
      : Workspaces.SPACE_CHARACTER.BLANK_SPACE,
    description: description ? description : "",
  });
  if (!newWorkspace) {
    return { error: errors[3] };
  }

  return { workspace: newWorkspace };
};

module.exports = {
  rules,
  addWorkspace,
};
