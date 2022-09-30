const Users = require("../../../models/Users");
const Workspaces = require("../../../models/Workspaces");
const WorkspaceMembers = require("../../../models/WorkspaceMembers");

const rules = {
  workspaceId: "required|integer",
  ownerUserId: "required|integer",
  creatorUserId: "required|integer",
  userId: "required|integer",
  role: "required|in:'Owner','Admin','Editor','Viewer'",
};

const errors = {
  1: {
    code: "ERR-ADDMEMBER-01",
    message: "Workspace, owner, and creator are unrelated to each other.",
  },
  2: {
    code: "ERR-ADDMEMBER-02",
    message: "User does not exists.",
  },
  3: {
    code: "ERR-ADDMEMBER-03",
    message: "Workspace member already exists.",
  },
  4: {
    code: "ERR-ADDMEMBER-04",
    message: "Unable to create workspace member record.",
  },
};

const addMember = async body => {
  const { workspaceId, ownerUserId, creatorUserId, userId, role } = body;

  const workspaceMember = await Workspaces.relatedQuery("members")
    .select("id")
    .for(workspaceId)
    .where("user_id", creatorUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[1] };
  }

  const user = await Users.query().select("id").findById(userId);
  if (!user) {
    return { error: errors[2] };
  }

  const existingMember = await WorkspaceMembers.query()
    .select("id")
    .where("workspace_id", workspaceId)
    .where("user_id", userId)
    .first();
  if (existingMember) {
    return { error: errors[3] };
  }

  const newMember = await WorkspaceMembers.query().insertAndFetch({
    workspace_id: workspaceId,
    owner_user_id: ownerUserId,
    creator_user_id: creatorUserId,
    user_id: userId,
    role,
  });
  if (!newMember) {
    return { error: errors[4] };
  }

  return { member: newMember };
};

module.exports = {
  rules,
  addMember,
};
