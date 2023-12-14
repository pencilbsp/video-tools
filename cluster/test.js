function toTimestamp() {
  // Chuỗi thời gian
  const timeString = "12/11/2024, 22:58:16"

  // Chuyển đổi thành đối tượng Date
  const dateObject = new Date(timeString)

  // Lấy timestamp (miligiây kể từ thời điểm Unix Epoch - 1/1/1970)
  const timestamp = dateObject.getTime()

  console.log(timestamp / 1000)
}

toTimestamp()
