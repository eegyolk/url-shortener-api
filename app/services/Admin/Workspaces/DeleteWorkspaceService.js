const Workspaces = require("../../../models/Workspaces");

const rules = {
  ownerUserId: "required|integer",
  deletedByUserId: "required|integer",
  workspaceId: "required|integer",
  id: "required|integer",
};

const errors = {
  1: {
    code: "ERR-DELETEWORKSPACE-01",
    message: "Workspace, owner, and editor are unrelated to each other.",
  },
};

const deleteWorkspace = async body => {
  const { ownerUserId, deletedByUserId, workspaceId, id } = body;

  const workspaceMember = await Workspaces.relatedQuery("members")
    .select("id")
    .for(workspaceId)
    .where("user_id", deletedByUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[1] };
  }

  const numberOfDeletedRows = await Workspaces.query().deleteById(id);

  return {
    deletedCount: numberOfDeletedRows,
  };
};

module.exports = {
  rules,
  deleteWorkspace,
};
