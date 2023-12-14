import { PrismaClient } from "@prisma/client"

function getSelection(select) {
  // Xoá trường _id
  const $project = { _id: 0 }
  if (typeof select === "object") {
    Object.keys(select).forEach((key) => {
      if (select[key] === true) $project[key] = 1
    })
  }

  return $project
}

const toDateString = (dateField) => ({
  $dateToString: {
    format: "%Y-%m-%dT%H:%M:%S.%LZ", // Định dạng ngày mong muốn
    date: `$${dateField}`, // Tên trường chứa ngày trong tài liệu
  },
})

function getPipeline(query = {}) {
  const take = query.take
  const skip = query.skip || 0
  const select = query.select || {}
  const where = query.where || { text: "" }

  const aggregates = []

  // Tạo project cho model
  const $project = getSelection(select)
  const $addFields = {
    id: { $toString: "$_id" },
    createdAt: toDateString("createdAt"),
    updatedAt: toDateString("updatedAt"),
  }

  // Tìm kiếm full text search
  const $match = {
    $text: {
      $search: `\"${where.text}\"`,
      $diacriticSensitive: true,
    },
  }

  // Thêm điều kiện tìm userId
  if (where.userId) $match.userId = { $oid: where.userId }
  // Thêm điều kiện tìm style
  if (typeof where.isStyle === "boolean") $match.isStyle = where.isStyle

  // Thêm toán tử tìm kiếm
  aggregates.push({ $match })

  /**
   * Nếu người dùng yêu cầu chọn thêm trường file
   * chúng ta cần xử lý truy vấn lookup
   */
  if (select.file) {
    // Thêm toán tử tìm kiếm file thông qua fileId
    const $lookup = {
      from: "File",
      localField: "fileId",
      foreignField: "_id",
      as: "files",
      pipeline: [{ $addFields: { ...$addFields } }],
    }

    if (typeof select.file === "boolean" && select.file === true) {
      $lookup.pipeline.push({ $project: getSelection(select.file) })
    }

    if (typeof select.file === "object" && select.file.select) {
      $lookup.pipeline.push({ $project: getSelection(select.file.select) })
    }

    aggregates.push({ $lookup })

    // Chuyển mảng files có 1 phần từ thành trường file
    $addFields.file = { $arrayElemAt: ["$files", 0] }

    // Loại bỏ mảng files
    // $project.files = 0

    //
    $project.file = 1
  }

  aggregates.push({ $addFields })

  aggregates.push({ $project })

  const $facet = {
    data: [{ $skip: skip }],
    total: [{ $count: "count" }],
  }

  if (take) $facet.data.push({ $limit: take })

  aggregates.push({ $facet })

  return aggregates
}

function convertData(data) {
  return data.map((item) => {
    Object.keys(item).forEach((key) => {
      const value = item[key]
      if (typeof value === "object") {
        if (value["$oid"]) Object.assign(item, { [key]: value["$oid"] })
        if (value["$date"]) Object.assign(item, { [key]: new Date(value["$date"]) })
      }
    })

    return item
  })
}

/**
 * @type PrismaClient
 */
const prisma =
  globalThis.prisma ??
  new PrismaClient().$extends({
    model: {
      $allModels: {
        async textSearch(query) {
          const pipeline = getPipeline(query)
          // console.log(pipeline[1].$lookup)
          const results = await this.aggregateRaw({ pipeline })
          const data = convertData(results[0].data)
          const total = results[0].total[0]?.count ?? 0

          return { data, total }
        },
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma

export default prisma
