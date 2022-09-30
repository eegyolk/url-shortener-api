const UTMParameterTemplates = require("../../../models/UTMParameterTemplates");
const UTMParameters = require("../../../models/UTMParameters");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  ownerUserId: "required|integer",
  creatorUserId: "required|integer",
  workspaceId: "required|integer",
  name: "required|string",
  utmSource: "required|string",
  utmMedium: "required|string",
  utmCampaign: "required|string",
  utmTerm: "present|string",
  utmContent: "present|string",
  description: "present|string",
};

const errors = {
  1: {
    code: "ERR-ADDPARAMETERTEMPLATE-01",
    message: "Workspace, owner, and creator are unrelated to each other.",
  },
  2: {
    code: "ERR-ADDPARAMETERTEMPLATE-02",
    message: "UTM parameter value doest not exists.",
  },
  3: {
    code: "ERR-ADDPARAMETERTEMPLATE-03",
    message: "UTM parameter tempate already exists.",
  },
  4: {
    code: "ERR-ADDPARAMETERTEMPLATE-04",
    message: "Unable to create UTM parameter template record.",
  },
};

const addUTMTemplate = async body => {
  const {
    ownerUserId,
    creatorUserId,
    workspaceId,
    name,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    description,
  } = body;

  const workspaceMember = await Workspaces.relatedQuery("members")
    .select("id")
    .for(workspaceId)
    .where("user_id", creatorUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[1] };
  }

  let existingUTMParameterValue = UTMParameters.relatedQuery("parameterValues")
    .select("id")
    .for(UTMParameters.UTM_PARAMETER.SOURCE.code)
    .where("utm_source", utmSource)
    .first();
  if (!existingUTMParameterValue) {
    return { error: errors[2] };
  }

  existingUTMParameterValue = UTMParameters.relatedQuery("parameterValues")
    .select("id")
    .for(UTMParameters.UTM_PARAMETER.MEDIUM.code)
    .where("utm_medium", utmMedium)
    .first();
  if (!existingUTMParameterValue) {
    return { error: errors[2] };
  }

  existingUTMParameterValue = UTMParameters.relatedQuery("parameterValues")
    .select("id")
    .for(UTMParameters.UTM_PARAMETER.CAMPAIGN.code)
    .where("utm_campaign", utmCampaign)
    .first();
  if (!existingUTMParameterValue) {
    return { error: errors[2] };
  }

  if (utmTerm) {
    existingUTMParameterValue = UTMParameters.relatedQuery("parameterValues")
      .select("id")
      .for(UTMParameters.UTM_PARAMETER.TERM.code)
      .where("utm_term", utmTerm)
      .first();
    if (!existingUTMParameterValue) {
      return { error: errors[2] };
    }
  }

  if (utmContent) {
    existingUTMParameterValue = UTMParameters.relatedQuery("parameterValues")
      .select("id")
      .for(UTMParameters.UTM_PARAMETER.CONTENT.code)
      .where("utm_content", utmContent)
      .first();
    if (!existingUTMParameterValue) {
      return { error: errors[2] };
    }
  }

  const existingUTMParameterTemplate = await UTMParameterTemplates.query()
    .select("id")
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .where("name", name)
    .first();
  if (existingUTMParameterTemplate) {
    return { error: errors[3] };
  }

  const newUTMParameterTemplate =
    await UTMParameterTemplates.query().insertAndFetch({
      owner_user_id: ownerUserId,
      creator_user_id: creatorUserId,
      workspace_id: workspaceId,
      name,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_term: utmTerm ? utmTerm : "",
      utm_content: utmContent ? utmContent : "",
      description: description ? description : "",
    });
  if (!newUTMParameterTemplate) {
    return { error: errors[4] };
  }

  return { utmParameterTemplate: newUTMParameterTemplate };
};

module.exports = {
  rules,
  addUTMTemplate,
};
