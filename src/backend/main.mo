import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type LeadStatus = {
    #new;
    #contacted;
    #qualified;
    #proposal;
    #closedWon;
    #closedLost;
  };

  module LeadStatus {
    public func toText(status : LeadStatus) : Text {
      switch (status) {
        case (#new) { "NEW" };
        case (#contacted) { "CONTACTED" };
        case (#qualified) { "QUALIFIED" };
        case (#proposal) { "PROPOSAL" };
        case (#closedWon) { "CLOSED_WON" };
        case (#closedLost) { "CLOSED_LOST" };
      };
    };
  };

  type Note = {
    timestamp : Int;
    text : Text;
  };

  type Lead = {
    id : Nat;
    owner : Principal;
    name : Text;
    company : Text;
    email : Text;
    phone : Text;
    status : LeadStatus;
    dealValue : Float;
    notes : [Note];
    createdAt : Int;
    updatedAt : Int;
  };

  module Lead {
    public func compare(l1 : Lead, l2 : Lead) : Order.Order {
      Nat.compare(l1.id, l2.id);
    };

    public func compareByUpdatedAt(l1 : Lead, l2 : Lead) : Order.Order {
      Int.compare(l2.updatedAt, l1.updatedAt);
    };

    public func compareByCreatedAt(l1 : Lead, l2 : Lead) : Order.Order {
      Int.compare(l2.createdAt, l1.createdAt);
    };

    public func compareByDealValue(l1 : Lead, l2 : Lead) : Order.Order {
      compareFloat(l2.dealValue, l1.dealValue);
    };

    public func compareByStatus(l1 : Lead, l2 : Lead) : Order.Order {
      let statusOrder = Nat.compare(statusToNat(l1.status), statusToNat(l2.status));
      switch (statusOrder) {
        case (#equal) { Int.compare(l2.updatedAt, l1.updatedAt) };
        case (o) { o };
      };
    };

    func statusToNat(status : LeadStatus) : Nat {
      switch (status) {
        case (#new) { 0 };
        case (#contacted) { 1 };
        case (#qualified) { 2 };
        case (#proposal) { 3 };
        case (#closedWon) { 4 };
        case (#closedLost) { 5 };
      };
    };

    func compareFloat(a : Float, b : Float) : Order.Order {
      if (a == b) { #equal } else if (a < b) { #less } else { #greater };
    };
  };

  type LeadInput = {
    name : Text;
    company : Text;
    email : Text;
    phone : Text;
    dealValue : Float;
  };

  type LeadUpdateInput = {
    id : Nat;
    company : ?Text;
    email : ?Text;
    phone : ?Text;
    dealValue : ?Float;
  };

  type Stats = {
    totalLeads : Nat;
    activeDeals : Nat;
    closedWon : Nat;
    closedLost : Nat;
    totalPipelineValue : Float;
    conversionRate : Float;
    recentActivity : [Lead];
  };

  public type UserProfile = {
    name : Text;
  };

  let leads = Map.empty<Nat, Lead>();
  var nextLeadId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();

  func getLeadInternal(leadId : Nat) : Lead {
    switch (leads.get(leadId)) {
      case (null) { Runtime.trap("Lead not found") };
      case (?lead) { lead };
    };
  };

  func getLeadOwnershipInternal(leadId : Nat) : Principal {
    let lead = getLeadInternal(leadId);
    lead.owner;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getLead(leadId : Nat) : async Lead {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only sales reps can view leads");
    };
    let lead = getLeadInternal(leadId);
    if (lead.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot view other user's lead");
    };
    lead;
  };

  public query ({ caller }) func listLeads() : async [Lead] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only sales reps can view leads");
    };
    let allLeads = leads.values().toArray();
    // Admins see all leads, sales reps see only their own
    if (AccessControl.isAdmin(accessControlState, caller)) {
      allLeads.sort();
    } else {
      allLeads.filter(func(lead) { lead.owner == caller }).sort();
    };
  };

  public query ({ caller }) func getLeadsByOwner(owner : Principal) : async [Lead] {
    if (not (AccessControl.isAdmin(accessControlState, caller) or caller == owner)) {
      Runtime.trap("Unauthorized: Cannot view other user's leads");
    };
    leads.values().toArray().filter(func(lead) { lead.owner == owner }).sort();
  };

  public shared ({ caller }) func createLead(leadInput : LeadInput) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only sales reps can create leads");
    };
    let leadId = nextLeadId;
    nextLeadId += 1;

    let lead : Lead = {
      leadInput with
      id = leadId;
      owner = caller;
      status = #new;
      notes = [];
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    leads.add(leadId, lead);
    leadId;
  };

  public shared ({ caller }) func updateLead(input : LeadUpdateInput) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only sales reps can update leads");
    };
    let existingLead = getLeadInternal(input.id);
    if (existingLead.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot update other user's lead");
    };
    let updatedLead : Lead = {
      existingLead with
      company = switch (input.company) {
        case (null) { existingLead.company };
        case (?c) { c };
      };
      email = switch (input.email) {
        case (null) { existingLead.email };
        case (?e) { e };
      };
      phone = switch (input.phone) {
        case (null) { existingLead.phone };
        case (?p) { p };
      };
      dealValue = switch (input.dealValue) {
        case (null) { existingLead.dealValue };
        case (?v) { v };
      };
      updatedAt = Time.now();
    };
    leads.add(input.id, updatedLead);
  };

  public shared ({ caller }) func deleteLead(leadId : Nat) : async () {
    // Only admins can delete leads
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete leads");
    };
    let existingLead = getLeadInternal(leadId);
    leads.remove(leadId);
  };

  public shared ({ caller }) func updateLeadStatus(leadId : Nat, newStatus : LeadStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only sales reps can update leads");
    };
    let existingLead = getLeadInternal(leadId);

    if (existingLead.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot update other user's lead");
    };

    let updatedLead = {
      existingLead with
      status = newStatus;
      updatedAt = Time.now();
    };
    leads.add(leadId, updatedLead);
  };

  public shared ({ caller }) func addLeadNote(leadId : Nat, noteText : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only sales reps can update leads");
    };
    let existingLead = getLeadInternal(leadId);
    if (existingLead.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot update other user's lead");
    };
    let newNote = { timestamp = Time.now(); text = noteText };
    let notesList = List.fromArray<Note>(existingLead.notes);
    notesList.add(newNote);
    let updatedLead = {
      existingLead with
      notes = notesList.toArray();
      updatedAt = Time.now();
    };
    leads.add(leadId, updatedLead);
  };

  public query ({ caller }) func getSuggestions(leadId : Nat) : async [Text] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only sales reps can view suggestions");
    };
    let lead = getLeadInternal(leadId);
    if (lead.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot view suggestions for other user's lead");
    };

    switch (lead.status) {
      case (#new) {
        [
          "Personalize your outreach message based on the lead's company profile.",
          "Leverage mutual connections for an introduction.",
          "Highlight specific pain points your solution addresses.",
        ];
      };
      case (#contacted) {
        [
          "Follow up with a case study relevant to the lead's industry.",
          "Ask insightful questions to uncover deeper needs.",
          "Schedule a call or demo to showcase product features.",
        ];
      };
      case (#qualified) {
        [
          "Identify decision makers and influencers in the account.",
          "Map out the lead's buying process and timeline.",
          "Prepare a tailored value proposition focused on the lead.",
        ];
      };
      case (#proposal) {
        [
          "Clearly outline the ROI and business impact of your proposal.",
          "Address any objections or concerns proactively.",
          "Confirm next steps and timeline for signing.",
        ];
      };
      case (#closedWon) {
        [
          "Thank the customer and reinforce the partnership.",
          "Set expectations for onboarding and implementation.",
          "Ask for referrals and testimonials to leverage success.",
        ];
      };
      case (#closedLost) {
        [
          "Solicit feedback on why the deal was lost.",
          "Stay in touch for future opportunities or needs.",
          "Review and iterate your sales process based on learnings.",
        ];
      };
    };
  };

  public query ({ caller }) func getStats() : async Stats {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only sales reps can view stats");
    };
    
    // Filter leads based on role: admins see all, sales reps see only their own
    let relevantLeads = if (AccessControl.isAdmin(accessControlState, caller)) {
      leads.values().toArray();
    } else {
      leads.values().toArray().filter(func(lead) { lead.owner == caller });
    };

    var totalLeads = relevantLeads.size();
    var activeDeals = 0;
    var closedWon = 0;
    var closedLost = 0;
    var totalPipelineValue = 0.0;
    var conversionRate = 0.0;

    for (lead in relevantLeads.values()) {
      switch (lead.status) {
        case (#closedWon) { closedWon += 1 };
        case (#closedLost) { closedLost += 1 };
        case (#new) { activeDeals += 1 };
        case (#qualified) { activeDeals += 1 };
        case (#contacted) { activeDeals += 1 };
        case (#proposal) { activeDeals += 1 };
      };
      totalPipelineValue += lead.dealValue;
    };

    let nonLostLeads = if (totalLeads > closedLost) {
      totalLeads - closedLost;
    } else { 0 };

    conversionRate := if (nonLostLeads > 0) {
      closedWon.toFloat() / nonLostLeads.toFloat();
    } else { 0.0 };

    let recentActivity = relevantLeads.sort(Lead.compareByUpdatedAt).sliceToArray(0, Nat.min(5, totalLeads));

    {
      totalLeads;
      activeDeals;
      closedWon;
      closedLost;
      totalPipelineValue;
      conversionRate;
      recentActivity;
    };
  };
};
