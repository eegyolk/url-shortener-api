const UTMParameterValues = require("../../../models/UTMParameterValues");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  ownerUserId: "required|integer",
  deletedByUserId: "required|integer",
  workspaceId: "required|integer",
  ids: "required",
};

const errors = {
  1: {
    code: "ERR-DELETEUTMPARAMETERVALUE-01",
    message: "Workspace, owner, and editor are unrelated to each other.",
  },
};

const deleteUTMParameter = async body => {
  const { ownerUserId, deletedByUserId, workspaceId, ids } = body;

  const workspaceMember = await Workspaces.relatedQuery("members")
    .select("id")
    .for(workspaceId)
    .where("user_id", deletedByUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[1] };
  }

  const numberOfDeletedRows = await UTMParameterValues.query().deleteById(ids);

  return {
    deletedCount: numberOfDeletedRows,
  };
};

module.exports = {
  rules,
  deleteUTMParameter,
};
