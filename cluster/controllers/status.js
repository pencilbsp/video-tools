import { START_TIME } from "../configs.js"

export default async function status(req, res) {
  // const uptime = Date.now() - START_TIME
  res.json({ online: true, uptime: START_TIME })
}
