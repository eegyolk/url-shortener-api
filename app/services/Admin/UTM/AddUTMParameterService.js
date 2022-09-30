const UTMParameters = require("../../../models/UTMParameters");
const UTMParameterValues = require("../../../models/UTMParameterValues");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  utmParameterId: "required|integer",
  ownerUserId: "required|integer",
  creatorUserId: "required|integer",
  workspaceId: "required|integer",
  value: "required|string",
};

const errors = {
  1: {
    code: "ERR-ADDPARAMETERVALUE-01",
    message: "UTM parameter does not exists.",
  },
  2: {
    code: "ERR-ADDPARAMETERVALUE-02",
    message: "Workspace, owner, and creator are unrelated to each other.",
  },
  3: {
    code: "ERR-ADDPARAMETERVALUE-03",
    message: "UTM parameter value already exists.",
  },
  4: {
    code: "ERR-ADDPARAMETERVALUE-04",
    message: "Unable to create UTM parameter value record.",
  },
};

const addUTMParameter = async body => {
  const { utmParameterId, ownerUserId, creatorUserId, workspaceId, value } =
    body;

  const existingUTMParameter = await UTMParameters.query()
    .select("id")
    .findById(utmParameterId);
  if (!existingUTMParameter) {
    return { error: errors[1] };
  }

  const workspaceMember = await Workspaces.relatedQuery("members")
    .select("id")
    .for(workspaceId)
    .where("user_id", creatorUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[2] };
  }

  const existingUTMParameterValue = await UTMParameterValues.query()
    .select("id")
    .where("utm_parameter_id", utmParameterId)
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .where("value", value)
    .first();
  if (existingUTMParameterValue) {
    return { error: errors[3] };
  }

  const newUTMParameterValue = await UTMParameterValues.query().insertAndFetch({
    utm_parameter_id: utmParameterId,
    owner_user_id: ownerUserId,
    creator_user_id: creatorUserId,
    workspace_id: workspaceId,
    value,
  });
  if (!newUTMParameterValue) {
    return { error: errors[4] };
  }

  return { utmParameterValue: newUTMParameterValue };
};

module.exports = {
  rules,
  addUTMParameter,
};
