function changeDatetimeUtc7(date,time){
    // example of date and time = 14-Mar-2024 18:37:10
    const date_part = date.split('-')
    const time_part = time.split(':')
    const month = {
        "Jan": "00",
        "Feb": "01",
        "Mar": "02",
        "Apr": "03",
        "May": "04",
        "Jun": "05",
        "Jul": "06",
        "Aug": "07",
        "Sep": "08",
        "Oct": "09",
        "Nov": "10",
        "Dec": "11"
    }

    let date_construct = new Date()

    const month_number = month[date_part[1]]

    date_construct.setUTCFullYear(date_part[2],month_number,date_part[0])

    date_construct.setUTCHours(time_part[0],time_part[1],time_part[2])

    return date_construct
}

module.exports = {
    changeDateToIndo: changeDatetimeUtc7
}