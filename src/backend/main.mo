import Map "mo:core/Map";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";


// Apply migration using with clause

actor {
  type Category = {
    target : Float;
    achieved : Float;
  };

  type SalesData = {
    overallSale : Category;
    withoutCoin : Category;
    studded : Category;
    plain : Category;
    plan : Category;
    value : Category;
  };

  type SalesKey = {
    year : Nat;
    month : Nat;
  };

  type User = {
    mobile : Text;
    password : Text;
  };

  module SalesKey {
    public func compare(key1 : SalesKey, key2 : SalesKey) : Order.Order {
      switch (Nat.compare(key1.year, key2.year)) {
        case (#equal) { Nat.compare(key1.month, key2.month) };
        case (order) { order };
      };
    };
  };

  type UserData = {
    profile : User;
    salesData : Map.Map<SalesKey, SalesData>;
  };

  var adminMobile : ?Text = null;

  let userMap = Map.empty<Text, UserData>();

  // User registration and authentication
  public shared ({ caller }) func registerUser(mobile : Text, password : Text) : async Bool {
    if (userMap.containsKey(mobile)) {
      return false;
    };

    let newUser : User = { mobile; password };

    let newUserData : UserData = {
      profile = newUser;
      salesData = Map.empty<SalesKey, SalesData>();
    };

    userMap.add(mobile, newUserData);

    switch (adminMobile) {
      case (null) { adminMobile := ?mobile };
      case (_) {};
    };

    true;
  };

  public shared ({ caller }) func loginUser(mobile : Text, password : Text) : async Bool {
    switch (userMap.get(mobile)) {
      case (null) { false };
      case (?userData) {
        userData.profile.password == password;
      };
    };
  };

  public query ({ caller }) func isAdminUser(mobile : Text) : async Bool {
    switch (adminMobile) {
      case (?admin) { admin == mobile };
      case (null) { false };
    };
  };

  public query ({ caller }) func listUsers() : async [Text] {
    userMap.keys().toArray();
  };

  public shared ({ caller }) func deleteUser(adminMobileId : Text, targetMobile : Text) : async Bool {
    if (not (await isAdminUser(adminMobileId))) { return false };

    userMap.remove(targetMobile);
    true;
  };

  // Sales data functions (per user)
  public shared ({ caller }) func saveMonth(userMobile : Text, key : SalesKey, data : SalesData) : async () {
    switch (userMap.get(userMobile)) {
      case (null) {
        Runtime.trap("User does not exist");
      };
      case (?userData) {
        userData.salesData.add(key, data);
        userMap.add(userMobile, userData);
      };
    };
  };

  public query ({ caller }) func getMonth(userMobile : Text, key : SalesKey) : async SalesData {
    switch (userMap.get(userMobile)) {
      case (null) {
        Runtime.trap("User does not exist");
      };
      case (?userData) {
        switch (userData.salesData.get(key)) {
          case (null) { getEmptySalesData() };
          case (?data) { data };
        };
      };
    };
  };

  func compareEntriesByYearMonth(a : (SalesKey, SalesData), b : (SalesKey, SalesData)) : Order.Order {
    switch (Nat.compare(a.0.year, b.0.year)) {
      case (#equal) { Nat.compare(a.0.month, b.0.month) };
      case (order) { order };
    };
  };

  public query ({ caller }) func getAllMonths(userMobile : Text) : async [(SalesKey, SalesData)] {
    switch (userMap.get(userMobile)) {
      case (null) { [] };
      case (?userData) {
        userData.salesData.toArray();
      };
    };
  };

  public query ({ caller }) func getAllMonthsSorted(userMobile : Text) : async [(SalesKey, SalesData)] {
    switch (userMap.get(userMobile)) {
      case (null) { [] };
      case (?userData) {
        userData.salesData.toArray().sort(compareEntriesByYearMonth);
      };
    };
  };

  func getEmptyCategory() : Category {
    {
      target = 0.0;
      achieved = 0.0;
    };
  };

  func getEmptySalesData() : SalesData {
    {
      overallSale = getEmptyCategory();
      withoutCoin = getEmptyCategory();
      studded = getEmptyCategory();
      plain = getEmptyCategory();
      plan = getEmptyCategory();
      value = getEmptyCategory();
    };
  };
};

