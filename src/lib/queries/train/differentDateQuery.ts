import { processGraphQLQuery } from "../../utils/queryUtils";

export const getDifferentDateTrain = (id: string) => {
    const [trainNumber, year, month, day] = id.split("-");

    return {
        query: processGraphQLQuery(differentDateQuery),
        variables: {
            trainNumber: Number(trainNumber),
            departureDate: `${year}-${month}-${day}`,
        },
    };
};

const differentDateQuery = `
query TrainByDate($trainNumber: Int!, $departureDate: Date!) {
  train(trainNumber: $trainNumber, departureDate: $departureDate) {
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
        passengerTraffic
        countryCode
        location
        name
        shortCode
        uicCode
        type
      }
      causes {
        categoryCode {
          code
          name
          validFrom
          validTo
        }
        detailedCategoryCode {
          code
          name
          validFrom
          validTo
        }
        thirdCategoryCode {
          code
          name
          validFrom
          validTo
        }
      }
    }
  }
}
`;
