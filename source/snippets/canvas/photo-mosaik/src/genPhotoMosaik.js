const { createCanvas, loadImage } = require('canvas')
const { compressSize, childImageCompressSize } = require('../config')
const dataSource = require('../dataSource')

// 目标图片
const targetSrc = 'https://i.loli.net/2020/01/15/9YyPaf5lHCmoeRi.jpg'

// 目标图片每个像素由小图组成, 结果图片的尺寸就上上面二者相乘, 要以此尺寸构建一个大的canvas, 绘入子图片
const resultSize = compressSize * childImageCompressSize

// 压缩目标图片至40*40  我们需要40*40张子图片来组成这张大图
const loadTargetImageSync = async () => {
    let img = await loadImage(targetSrc)
    const size = Math.min(img.width, img.height)
    const canvas = createCanvas(compressSize, compressSize)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, size, size, 0, 0, compressSize, compressSize)
    let imageData = ctx.getImageData(0, 0, compressSize, compressSize)
    return imageData;
}


const main = async () => {
    let targetImageData = await loadTargetImageSync()
    let targetImagePixelData = targetImageData.data;
    let result = await drawResult(targetImagePixelData)
    return result
}

const drawResult = async (targetImagePixelData) => {
    const canvas = createCanvas(resultSize, resultSize)
    const ctx = canvas.getContext('2d')
    let length = targetImagePixelData.length / 4
    console.log("Console log: drawResult -> length", length)
    for (let i = 0; i < length; i++) {
        let targetR = targetImagePixelData[i * 4 + 0]
        let targetG = targetImagePixelData[i * 4 + 1]
        let targetB = targetImagePixelData[i * 4 + 2]
        // 当前像素所在的行、列序数
        const row = Math.floor(i / compressSize), col = i % compressSize;
        console.log("Console log: drawResult -> col", col)
        console.log("Console log: drawResult -> row", row)
        // 子图要放在最终大图的位置坐标
        let dx = col * childImageCompressSize, dy = row * childImageCompressSize
        let similarPic = await findSimilarPic(targetR, targetG, targetB)
        ctx.drawImage(similarPic, 0, 0, childImageCompressSize, childImageCompressSize, dx, dy, childImageCompressSize, childImageCompressSize)
    }
    return canvas.toDataURL()
}

// 以给定的rgb在dataSource中寻找色彩相似的图片
const findSimilarPic = async (targetR, targetG, targetB) => {
    let data, diff
    for (let i = 0; i < dataSource.length; i++) {
        const element = dataSource[i];
        let img = await loadImage(dataSource[i])
        let canvas = createCanvas(img.width, img.height)
        let ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        let pixelData = ctx.getImageData(0, 0, img.width, img.height)
        let [currentR, currentG, currentB] = calcAvg(pixelData)
        let distance = diffColor([targetR, targetG, targetB], [currentR, currentG, currentB])
        if (i === 0) {// 初始化
            data = img;
            diff = distance
        }
        if (distance < diff) {
            data = img;
            diff = distance
        }
    }
    return data
}

// 计算色彩rgb平均值
const calcAvg = (imgData) => {
    const pixelData = imgData.data
    let length = pixelData.length / 4
    let sumR = sumG = sumB = 0;
    for (let i = 0; i < length; i++) {
        sumR += pixelData[i * 4 + 0]
        sumG += pixelData[i * 4 + 1]
        sumB += pixelData[i * 4 + 2]
    }
    return [sumR / length, sumG / length, sumB / length]
}


// 比较rgb的差异返回差值
const diffColor = ([targetR, targetG, targetB], [currentR, currentG, currentB]) => {
    let r = Math.abs(targetR - currentR)
    let g = Math.abs(targetG - currentG)
    let b = Math.abs(targetB - currentB)
    return Math.sqrt(r ** 2 + g ** 2 + b ** 2)
}

module.exports = main