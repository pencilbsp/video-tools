import { serialNumber } from "./libs/system";

try {
    const s = await serialNumber();
    console.log(s);
} catch (error) {
    console.log(error.message);
}
