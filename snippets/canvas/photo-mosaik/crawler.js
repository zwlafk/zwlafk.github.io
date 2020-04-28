const axios = require('axios');
const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')

const { childImageCompressSize } = require('./config')

let queryCount = 0
let result = []

const fetchPics = async () => {
    console.log(result.length, 'result.length')
    if (result.length > 1700) {
        return result;
    }
    queryCount = queryCount + 50
    let { data: { data = [] } } = await axios.get('https://image.baidu.com/search/acjson?tn=resultjson_com&ipn=rj&ct=201326592&is=&fp=result&cl=2&lm=-1&ie=utf-8&oe=utf-8&adpicid=&st=-1&z=&ic=&hd=&latest=&copyright=&s=&se=&tab=&width=&height=&face=0&istype=2&qc=&nc=1&fr=&expermode=&force=&rn=50', {
        params: {
            queryWord: '猫',
            word: '猫',
            pn: queryCount
        }
    })
    data = data.filter(e => !!e.thumbURL).map(e => e.thumbURL)
    for (let i = 0; i < data.length; i++) {
        console.count('round')
        const src = data[i];
        try {
            let img = await loadImage(src)
            const size = Math.min(img.width, img.height)
            const canvas = createCanvas(childImageCompressSize, childImageCompressSize)
            const ctx = canvas.getContext('2d')
            // 从左上角截取一个最大正方形, 压缩至设置的尺寸
            ctx.drawImage(img, 0, 0, size, size, 0, 0, childImageCompressSize, childImageCompressSize)
            result.push(canvas.toDataURL())
        } catch (error) {
            console.log("Console log: run -> error", error)
        }
    }
    return fetchPics()
}

async function getDataSource() {
    let data = await fetchPics()
    fs.writeFile(`${__dirname}/dataSource.js`, 'module.exports=' + JSON.stringify(data), () => {
        console.log('done')
    })
}

getDataSource()
