export const isValidTrainId = (id: string) => {
    const [trainNumber, year, month, day, ...rest] = id.split("-");

    if (!trainNumber || !year || !month || !day || rest.length > 0) {
        return false;
    }

    const trainNumberValue = Number(trainNumber);
    const yearValue = Number(year);
    const monthValue = Number(month);
    const dayValue = Number(day);

    return (
        Number.isInteger(trainNumberValue) &&
        trainNumberValue > 0 &&
        /^\d{4}$/.test(year) &&
        Number.isInteger(yearValue) &&
        Number.isInteger(monthValue) &&
        monthValue >= 1 &&
        monthValue <= 12 &&
        Number.isInteger(dayValue) &&
        dayValue >= 1 &&
        dayValue <= 31
    );
};
