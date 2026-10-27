import { processGraphQLQuery } from "@/lib/queries/shared/queryUtils";

export const getSingleTrainQuery = (trainNumber: string) => {
    return {
        query: processGraphQLQuery(singleTrainQuery),
        variables: { trainNumber: Number(trainNumber) },
    };
};

const singleTrainQuery = `
query SingleTrain($trainNumber: Int!) {
  currentlyRunningTrains(
    where: {
      and: [{ operator: { shortCode: { equals: "vr" } } }, { trainNumber: { equals: $trainNumber } }]
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
      commercialTrack
      cancelled
      scheduledTime
      actualTime
      differenceInMinutes
      liveEstimateTime
      station {
        name
        shortCode
      }
      causes {
        categoryCode {
          name
        }
        detailedCategoryCode {
          name
        }
        thirdCategoryCode {
          name
        }
      }
    }
  }
}
`;
