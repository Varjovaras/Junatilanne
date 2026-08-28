import { processGraphQLQuery } from "../../utils/queryUtils";

export const getDifferentDateTrain = (id: string) => {
    const url = id.split("-");
    const trainNumber = url[0];
    const date = `"${url[1]}-${url[2]}-${url[3]}"`;

    return processGraphQLQuery(
        differentDateQuery
            .replace("TRAIN_NUMBER", trainNumber.toString())
            .replace("DEPARTURE_DATE", date),
    );
};

const differentDateQuery = `{
  train(trainNumber: TRAIN_NUMBER, departureDate: DEPARTURE_DATE) {
  cancelled
      commuterLineid
      departureDate
      runningCurrently
      trainNumber
      timetableType
      trainType {
        name
        trainCategory {
          name
        }
      }
      trainLocations(orderBy: { timestamp: DESCENDING }, take: 1) {
        speed
        location
      }
      trainTrackingMessages(take: 1) {
        timestamp
        trackSectionCode
        nextTrackSectionCode
        previousTrackSectionCode
        type
        station {
          passengerTraffic
          countryCode
          location
          name
          shortCode
          uicCode
          type
        }
        nextStation {
          passengerTraffic
          countryCode
          location
          name
          shortCode
          uicCode
          type
        }
        previousStation {
          passengerTraffic
          countryCode
          location
          name
          shortCode
          uicCode
          type
        }
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
        estimateSourceType
        unknownDelay
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
  }`;
