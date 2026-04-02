import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Nat "mo:core/Nat";

actor {
  type Category = {
    target : Nat;
    achieved : Nat;
  };

  type SalesData = {
    overallSale : Category;
    withoutCoin : Category;
    studded : Category;
    plain : Category;
    plan : Category;
  };

  type SalesKey = {
    year : Nat;
    month : Nat;
  };

  module SalesKey {
    public func compare(key1 : SalesKey, key2 : SalesKey) : Order.Order {
      switch (Nat.compare(key1.year, key2.year)) {
        case (#equal) { Nat.compare(key1.month, key2.month) };
        case (order) { order };
      };
    };
  };

  let salesMap = Map.empty<SalesKey, SalesData>();

  func compareSalesKeyData(tuple1 : (SalesKey, SalesData), tuple2 : (SalesKey, SalesData)) : Order.Order {
    switch (SalesKey.compare(tuple1.0, tuple2.0)) {
      case (#equal) { Nat.compare(tuple1.0.year, tuple2.0.year) };
      case (order) { order };
    };
  };

  public shared ({ caller }) func saveMonth(key : SalesKey, data : SalesData) : async () {
    salesMap.add(key, data);
  };

  public query ({ caller }) func getMonth(key : SalesKey) : async SalesData {
    switch (salesMap.get(key)) {
      case (null) { Runtime.trap("No data for given year and month") };
      case (?data) { data };
    };
  };

  public query ({ caller }) func getAllMonths() : async [(SalesKey, SalesData)] {
    salesMap.toArray();
  };

  public query ({ caller }) func getAllMonthsSorted() : async [(SalesKey, SalesData)] {
    salesMap.toArray().sort(compareSalesKeyData);
  };
};
