
// 为了减少计算量 遍历像素数据时做压缩处理, 尺寸设置

const compressSize = 40 // 目标图片压缩的尺寸
const childImageCompressSize = 20 // 子图片压缩的尺寸

module.exports = {
    compressSize,
    childImageCompressSize
}