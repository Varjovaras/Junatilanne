import { processGraphQLQuery } from "../../utils/queryUtils";

export const getSingleTrainQuery = (trainNumber: string) => {
    return processGraphQLQuery(singleTrainQuery.replace("XYZ", trainNumber));
};

const singleTrainQuery = `{
      currentlyRunningTrains(
        where: {and: [{operator: {shortCode: {equals: "vr"}}}, {trainNumber: {equals: XYZ}}]}
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
        trainLocations(orderBy: {timestamp: DESCENDING}, take: 1) {
          speed
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
    }`;
