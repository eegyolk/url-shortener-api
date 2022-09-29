const express = require("express");

// Middlewares
const AuthMiddleware = require("../app/http/middlewares/AuthMiddleware");
const CSRFMiddleware = require("../app/http/middlewares/CSRFMiddleware");
const RealPasswordMiddleware = require("../app/http/middlewares/RealPasswordMiddleware");

// Controllers
const CSRFCookieController = require("../app/http/controllers/CSRFCookieController");

const ResendVerificationController = require("../app/http/controllers/AccountRegistry/ResendVerificationController");
const SignUpController = require("../app/http/controllers/AccountRegistry/SignUpController");
const VerifyAccountController = require("../app/http/controllers/AccountRegistry/VerifyAccountController");

const MeController = require("../app/http/controllers/Authentication/MeController");
const SignInController = require("../app/http/controllers/Authentication/SignInController");
const SignOutController = require("../app/http/controllers/Authentication/SignOutController");

const ForgotPasswordController = require("../app/http/controllers/PasswordRecovery/ForgotPasswordController");
const ResetPasswordController = require("../app/http/controllers/PasswordRecovery/ResetPasswordController");

const AddChannelController = require("../app/http/controllers/Admin/Channels/AddChannelController");
const DeleteChannelController = require("../app/http/controllers/Admin/Channels/DeleteChannelController");
const EditChannelController = require("../app/http/controllers/Admin/Channels/EditChannelController");
const FetchChannelController = require("../app/http/controllers/Admin/Channels/FetchChannelController");
const SearchAndFilterChannelController = require("../app/http/controllers/Admin/Channels/SearchAndFilterChannelController");

const AddDomainController = require("../app/http/controllers/Admin/Domains/AddDomainController");
const DeleteDomainController = require("../app/http/controllers/Admin/Domains/DeleteDomainController");
const EditDomainController = require("../app/http/controllers/Admin/Domains/EditDomainController");
const FetchDomainController = require("../app/http/controllers/Admin/Domains/FetchDomainController");
const SearchAndFilterDomainController = require("../app/http/controllers/Admin/Domains/SearchAndFilterDomainController");

const AddLinkController = require("../app/http/controllers/Admin/Links/AddLinkController");
const DeleteLinkController = require("../app/http/controllers/Admin/Links/DeleteLinkController");
const EditLinkController = require("../app/http/controllers/Admin/Links/EditLinkController");
const FetchLinkController = require("../app/http/controllers/Admin/Links/FetchLinkController");
const SearchAndFilterLinkController = require("../app/http/controllers/Admin/Links/SearchAndFilterLinkController");
const UtilityLinkController = require("../app/http/controllers/Admin/Links/UtilityLinkController");

const AddTagController = require("../app/http/controllers/Admin/Tags/AddTagController");
const DeleteTagController = require("../app/http/controllers/Admin/Tags/DeleteTagController");
const EditTagController = require("../app/http/controllers/Admin/Tags/EditTagController");
const FetchTagController = require("../app/http/controllers/Admin/Tags/FetchTagController");
const SearchAndFilterTagController = require("../app/http/controllers/Admin/Tags/SearchAndFilterTagController");

const AddUTMParameterController = require("../app/http/controllers/Admin/UTM/AddUTMParameterController");
const DeleteUTMParameterController = require("../app/http/controllers/Admin/UTM/DeleteUTMParameterController");
const EditUTMParameterController = require("../app/http/controllers/Admin/UTM/EditUTMParameterController");
const FetchUTMParameterController = require("../app/http/controllers/Admin/UTM/FetchUTMParameterController");
const SearchAndFilterUTMParameterController = require("../app/http/controllers/Admin/UTM/SearchAndFilterUTMParameterController");

const AddUTMTemplateController = require("../app/http/controllers/Admin/UTM/AddUTMTemplateController");
const DeleteUTMTemplateController = require("../app/http/controllers/Admin/UTM/DeleteUTMTemplateController");
const EditUTMTemplateController = require("../app/http/controllers/Admin/UTM/EditUTMTemplateController");
const FetchUTMTemplateController = require("../app/http/controllers/Admin/UTM/FetchUTMTemplateController");
const SearchAndFilterUTMTemplateController = require("../app/http/controllers/Admin/UTM/SearchAndFilterUTMTemplateController");

const AddMemberController = require("../app/http/controllers/Admin/Workspaces/AddMemberController");
const DeleteMemberController = require("../app/http/controllers/Admin/Workspaces/DeleteMemberController");
const EditMemberController = require("../app/http/controllers/Admin/Workspaces/EditMemberController");
const FetchMemberController = require("../app/http/controllers/Admin/Workspaces/FetchMemberController");
const SearchAndFilterMemberController = require("../app/http/controllers/Admin/Workspaces/SearchAndFilterMemberController");

const AddWorkspaceController = require("../app/http/controllers/Admin/Workspaces/AddWorkspaceController");
const DeleteWorkspaceController = require("../app/http/controllers/Admin/Workspaces/DeleteWorkspaceController");
const EditWorkspaceController = require("../app/http/controllers/Admin/Workspaces/EditWorkspaceController");
const FetchWorkspaceController = require("../app/http/controllers/Admin/Workspaces/FetchWorkspaceController");
const SearchAndFilterWorkspaceController = require("../app/http/controllers/Admin/Workspaces/SearchAndFilterWorkspaceController");

router = express.Router();

router.get("/", (req, res) => {
  res.send("For app component only");
});
router.get("/csrf-cookie", CSRFCookieController.getCSRFCookie);

// Authentication - Begin
router.post("/sign-in", CSRFMiddleware.checkCSRF, SignInController.signIn);
router.get(
  "/me",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  MeController.getMe
);
router.post(
  "/sign-out",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SignOutController.signOut
);
// Authentication - End

// Account Registry - Begin
router.post(
  "/sign-up",
  [CSRFMiddleware.checkCSRF, RealPasswordMiddleware.resolve],
  SignUpController.signUp
);
router.post(
  "/verify-account",
  CSRFMiddleware.checkCSRF,
  VerifyAccountController.verifyAccount
);
router.post(
  "/resend-verification",
  CSRFMiddleware.checkCSRF,
  ResendVerificationController.resendVerification
);
// Account Registry - End

// Password Recovery - Begin
router.post(
  "/forgot-password",
  CSRFMiddleware.checkCSRF,
  ForgotPasswordController.forgotPassword
);
router.post(
  "/reset-password",
  [CSRFMiddleware.checkCSRF, RealPasswordMiddleware.resolve],
  ResetPasswordController.resetPassword
);
// Password Recovery - End

// Links Related Routes - Begin
router.get(
  "/links/resolve",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  UtilityLinkController.resolve
);
router.get(
  "/links/suggest",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  UtilityLinkController.suggest
);
router.post(
  "/links",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  AddLinkController.addLink
);
router.put(
  "/links/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  EditLinkController.editLink
);
router.delete(
  "/links/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  DeleteLinkController.deleteLink
);
router.get(
  "/links",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchLinkController.fetchLink
);
router.get(
  "/links/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchLinkController.fetchLink
);
router.get(
  "/links/search",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterLinkController.searchLink
);
router.get(
  "/links/filter",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterLinkController.filterLink
);
// Links Related Routes - End

// Domains Related Routes - Begin
router.post(
  "/domains",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  AddDomainController.addDomain
);
router.put(
  "/domains/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  EditDomainController.editDomain
);
router.delete(
  "/domains/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  DeleteDomainController.deleteDomain
);
router.get(
  "/domains",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchDomainController.fetchDomain
);
router.get(
  "/domains/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchDomainController.fetchDomain
);
router.get(
  "/domains/search",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterDomainController.searchDomain
);
router.get(
  "/domains/filter",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterDomainController.filterDomain
);
// Domains Related Routes - End

// Tags Related Routes - Begin
router.post(
  "/tags",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  AddTagController.addTag
);
router.put(
  "/tags/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  EditTagController.editTag
);
router.delete(
  "/tags/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  DeleteTagController.deleteTag
);
router.get(
  "/tags",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchTagController.fetchTag
);
router.get(
  "/tags/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchTagController.fetchTag
);
router.get(
  "/tags/search",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterTagController.searchTag
);
router.get(
  "/tags/filter",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterTagController.filterTag
);
// Tags Related Routes - End

// Channels Related Routes - Begin
router.post(
  "/channels",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  AddChannelController.addChannel
);
router.put(
  "/channels/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  EditChannelController.editChannel
);
router.delete(
  "/channels/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  DeleteChannelController.deleteChannel
);
router.get(
  "/channels",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchChannelController.fetchChannel
);
router.get(
  "/channels/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchChannelController.fetchChannel
);
router.get(
  "/channels/search",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterChannelController.searchChannel
);
router.get(
  "/channels/filter",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterChannelController.filterChannel
);
// Channels Related Routes - End

// UTM Templates Related Routes - Begin
router.post(
  "/utm-templates",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  AddUTMTemplateController.addUTMTemplate
);
router.put(
  "/utm-templates/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  EditUTMTemplateController.editUTMTemplate
);
router.delete(
  "/utm-templates/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  DeleteUTMTemplateController.deleteUTMTemplate
);
router.get(
  "/utm-templates",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchUTMTemplateController.fetchUTMTemplate
);
router.get(
  "/utm-templates/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchUTMTemplateController.fetchUTMTemplate
);
router.get(
  "/utm-templates/search",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterUTMTemplateController.searchUTMTemplate
);
router.get(
  "/utm-templates/filter",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterUTMTemplateController.filterUTMTemplate
);
// UTM Templates Related Routes - End

// UTM Parameters Related Routes - Begin
router.post(
  "/utm-parameters",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  AddUTMParameterController.addUTMParameter
);
router.put(
  "/utm-parameters/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  EditUTMParameterController.editUTMParameter
);
router.delete(
  "/utm-parameters/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  DeleteUTMParameterController.deleteUTMParameter
);
router.get(
  "/utm-parameters",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchUTMParameterController.fetchUTMParameter
);
router.get(
  "/utm-parameters/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchUTMParameterController.fetchUTMParameter
);
router.get(
  "/utm-parameters/search",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterUTMParameterController.searchUTMParameter
);
router.get(
  "/utm-parameters/filter",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterUTMParameterController.filterUTMParameter
);
// UTM Parameters Related Routes - End

// Workspaces Related Routes - Begin
router.post(
  "/workspaces",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  AddWorkspaceController.addWorkspace
);
router.put(
  "/workspaces/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  EditWorkspaceController.editWorkspace
);
router.delete(
  "/workspaces/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  DeleteWorkspaceController.deleteWorkspace
);
router.get(
  "/workspaces",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchWorkspaceController.fetchWorkspace
);
router.get(
  "/workspaces/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchWorkspaceController.fetchWorkspace
);
router.get(
  "/workspaces/search",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterWorkspaceController.searchWorkspace
);
router.get(
  "/workspaces/filter",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterWorkspaceController.filterWorkspace
);
// Workspaces Related Routes - End

// Workspace Members Related Routes - Begin
router.post(
  "/workspace-members",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  AddMemberController.addMember
);
router.put(
  "/workspace-members/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  EditMemberController.editMember
);
router.delete(
  "/workspace-members/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  DeleteMemberController.deleteMember
);
router.get(
  "/workspace-members",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchMemberController.fetchMember
);
router.get(
  "/workspace-members/:id",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  FetchMemberController.fetchMember
);
router.get(
  "/workspace-members/search",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterMemberController.searchMember
);
router.get(
  "/workspworkspace-membersaces/filter",
  [AuthMiddleware.checkAuth, CSRFMiddleware.checkAuthCSRF],
  SearchAndFilterMemberController.filterMember
);
// Workspace Members Related Routes - End

module.exports = router;
