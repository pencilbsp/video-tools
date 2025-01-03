import prisma from "./prisma.js";

// async function test() {
//   try {
//     const style = await prisma.style.textSearch({
//       where: { text: "HHTROLL" },
//       select: { id: true, name: true, file: { select: { path: true } } },
//     })
//     console.log(style)
//   } catch (error) {
//     console.log(error)
//   }
// }

// test()

try {
    const style = await prisma.style.textSearch({
        where: { text: "HHTROLL" },
        select: { id: true, name: true, file: true, userId: true },
    });
    console.log(style.data[0]);
    // const style  = await prisma.style.findFirst()
    // console.log(style)
} catch (error) {
    console.log(error);
}
