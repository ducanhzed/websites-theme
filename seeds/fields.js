const mongoose = require('mongoose');
const Field = require('../models/fields')
const dotenv = require('dotenv')

dotenv.config()

const dataSet = ["thiết bị, dụng cụ",
    "thiết kế in ấn",
    "nhà hàng - khách sạn",
    "thời trang",
    "dịch vụ bảo vệ",
    "quà tặng",
    "du lịch",
    "vận chuyển",
    "linh kiện - điện tử",
    "thuỷ sản - nông sản",
    "Spa & Thẩm mỹ viện",
    "văn phòng phẩm",
    "Ô tô - xe máy",
    "xây dựng",
    "bất động sản",
    "dịch vụ",
    "giải trí",
    "công nghiệp",
    "mỹ phẩm",
    "phòng cháy chữa cháy",
    "nội thất",
    "điện lạnh",
    "bảo hành - sửa chữa",
    "bệnh viện - y tế",
    "thương mại diện tử",
    "viện khoa học",
    "nhà hàng tiệc cưới",
    "thực phẩm"]

mongoose.Promise = global.Promise;

// Connect MongoDB at default port 27017.
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/websiteTheme', {
    useNewUrlParser: true,
    useCreateIndex: true,
}, async (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')

        await Field.createCollection();
        for (let i in dataSet) {
            let seed = new Field({ name: dataSet[i].toLowerCase() })
            await seed.save()
            console.log(dataSet[i] + ' is saved !')
        }
        await mongoose.connection.close()
    } else {
        console.log('Error in DB connection: ' + err)
    }
});

