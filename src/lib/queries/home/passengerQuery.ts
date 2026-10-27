import { processGraphQLQuery } from "../../utils/queryUtils";

export const getPassengerQuery = () => {
    return processGraphQLQuery(passengerQuery);
};

const passengerQuery = `{
  currentlyRunningTrains(
    where: {
      and: [
        { operator: { shortCode: { equals: "vr" } } }
      ]
    }
  ) {
    cancelled
    commuterLineid
    departureDate
    runningCurrently
    trainNumber
    trainType {
      name
      trainCategory {
        name
      }
    }
    trainLocations(orderBy: { timestamp: DESCENDING }, take: 1) {
      speed
      timestamp
      location
    }
    timeTableRows {
      type
      trainStopping
      commercialStop
      cancelled
      scheduledTime
      actualTime
      differenceInMinutes
      liveEstimateTime
      station {
        name
        shortCode
        location
      }
    }
  }
}`;
