import { processGraphQLQuery } from "../../utils/queryUtils";

export const getMapQuery = () => {
    return processGraphQLQuery(mapQuery);
};

const mapQuery = `{
  currentlyRunningTrains(
    where: {
      and: [
        { operator: { shortCode: { equals: "vr" } } }
      ]
    }
  ) {
    trainNumber
    departureDate
    commuterLineid
    trainType {
      name
      trainCategory {
        name
      }
    }
    trainLocations(orderBy: { timestamp: DESCENDING }, take: 2) {
      speed
      timestamp
      location
    }
    timeTableRows(
      where: { actualTime: { unequals: null } }
      orderBy: { scheduledTime: DESCENDING }
      take: 1
    ) {
      differenceInMinutes
    }
  }
}`;
