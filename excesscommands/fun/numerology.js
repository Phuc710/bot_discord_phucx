/*
 * Numerology Command - Boo Bot
 * Made by Phucx
 * Thần số học Việt Nam
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Hàm chuyển đổi chữ cái thành số (theo Pythagoras)
function letterToNumber(letter) {
    const alphabet = {
        'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
        'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
        's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8,
        // Chữ cái tiếng Việt
        'á': 1, 'à': 1, 'ả': 1, 'ã': 1, 'ạ': 1,
        'ă': 1, 'ắ': 1, 'ằ': 1, 'ẳ': 1, 'ẵ': 1, 'ặ': 1,
        'â': 1, 'ấ': 1, 'ầ': 1, 'ẩ': 1, 'ẫ': 1, 'ậ': 1,
        'đ': 4,
        'é': 5, 'è': 5, 'ẻ': 5, 'ẽ': 5, 'ẹ': 5,
        'ê': 5, 'ế': 5, 'ề': 5, 'ể': 5, 'ễ': 5, 'ệ': 5,
        'í': 9, 'ì': 9, 'ỉ': 9, 'ĩ': 9, 'ị': 9,
        'ó': 6, 'ò': 6, 'ỏ': 6, 'õ': 6, 'ọ': 6,
        'ô': 6, 'ố': 6, 'ồ': 6, 'ổ': 6, 'ỗ': 6, 'ộ': 6,
        'ơ': 6, 'ớ': 6, 'ờ': 6, 'ở': 6, 'ỡ': 6, 'ợ': 6,
        'ú': 3, 'ù': 3, 'ủ': 3, 'ũ': 3, 'ụ': 3,
        'ư': 3, 'ứ': 3, 'ừ': 3, 'ử': 3, 'ữ': 3, 'ự': 3,
        'ý': 7, 'ỳ': 7, 'ỷ': 7, 'ỹ': 7, 'ỵ': 7,
    };
    
    return alphabet[letter.toLowerCase()] || 0;
}

// Hàm tính số chủ đạo từ tên
function calculateLifePath(name) {
    let sum = 0;
    for (const char of name) {
        if (char !== ' ') {
            sum += letterToNumber(char);
        }
    }
    
    // Rút gọn về 1 chữ số (trừ số 11, 22, 33 - số Master)
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    
    return sum;
}

// Hàm tính số từ ngày sinh
function calculateBirthNumber(day, month, year) {
    let sum = day + month + year;
    
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    
    return sum;
}

// Ý nghĩa các con số
function getNumberMeaning(number) {
    const meanings = {
        1: {
            title: '🌟 Số 1 - Người Lãnh Đạo',
            personality: 'Độc lập, sáng tạo, tự tin, quyết đoán',
            strengths: 'Tiên phong, dũng cảm, có tầm nhìn xa, khả năng lãnh đạo tốt',
            weaknesses: 'Có thể ích kỷ, bảo thủ, thích kiểm soát',
            career: 'Doanh nhân, CEO, nhà lãnh đạo, nghệ sĩ, nhà phát minh',
            love: 'Cần đối tác tôn trọng sự độc lập của bạn',
            color: '#FF0000'
        },
        2: {
            title: '🤝 Số 2 - Người Hòa Giải',
            personality: 'Hòa đồng, nhạy cảm, kiên nhẫn, khéo léo',
            strengths: 'Ngoại giao, hợp tác tốt, trực giác mạnh, tình cảm sâu sắc',
            weaknesses: 'Dễ bị tổn thương, thiếu quyết đoán, sợ xung đột',
            career: 'Ngoại giao, tư vấn, giáo viên, nghệ sĩ, y tế',
            love: 'Cần sự ổn định và an toàn trong tình yêu',
            color: '#FFA500'
        },
        3: {
            title: '🎨 Số 3 - Người Sáng Tạo',
            personality: 'Sáng tạo, lạc quan, hài hước, giao tiếp tốt',
            strengths: 'Nghệ thuật, diễn đạt xuất sắc, tràn đầy năng lượng',
            weaknesses: 'Thiếu tập trung, nông cạn, hay lo lắng',
            career: 'Nghệ sĩ, nhà văn, diễn viên, MC, marketing',
            love: 'Cần đối tác vui vẻ và hài hước',
            color: '#FFFF00'
        },
        4: {
            title: '🏗️ Số 4 - Người Xây Dựng',
            personality: 'Thực tế, có tổ chức, kỷ luật, đáng tin cậy',
            strengths: 'Chăm chỉ, chu đáo, có trách nhiệm, kiên trì',
            weaknesses: 'Cứng nhắc, bảo thủ, thiếu linh hoạt',
            career: 'Kỹ sư, kiến trúc sư, kế toán, quản lý, xây dựng',
            love: 'Cần sự ổn định và cam kết lâu dài',
            color: '#00FF00'
        },
        5: {
            title: '✈️ Số 5 - Người Tự Do',
            personality: 'Linh hoạt, phiêu lưu, tò mò, năng động',
            strengths: 'Thích ứng tốt, đa tài, giao tiếp xuất sắc',
            weaknesses: 'Không kiên định, bồn chồn, thiếu trách nhiệm',
            career: 'Du lịch, báo chí, sales, PR, kinh doanh quốc tế',
            love: 'Cần tự do và không gian cá nhân',
            color: '#0000FF'
        },
        6: {
            title: '💝 Số 6 - Người Nuôi Dưỡng',
            personality: 'Yêu thương, trách nhiệm, hòa bình, chăm sóc',
            strengths: 'Gia đình, hòa giải, trung thành, quan tâm người khác',
            weaknesses: 'Hy sinh quá mức, lo lắng, can thiệp',
            career: 'Giáo viên, y tá, tư vấn, nội thất, ẩm thực',
            love: 'Gia đình là ưu tiên hàng đầu',
            color: '#FF69B4'
        },
        7: {
            title: '🔮 Số 7 - Người Tìm Kiếm Chân Lý',
            personality: 'Trí tuệ, phân tích, tâm linh, bí ẩn',
            strengths: 'Suy nghĩ sâu sắc, trực giác mạnh, nghiên cứu',
            weaknesses: 'Cô độc, hoài nghi, khó gần',
            career: 'Nhà khoa học, nhà nghiên cứu, triết học, tâm linh',
            love: 'Cần đối tác hiểu được thế giới nội tâm',
            color: '#800080'
        },
        8: {
            title: '💰 Số 8 - Người Quyền Lực',
            personality: 'Tham vọng, thực tế, quyền lực, thành công',
            strengths: 'Quản lý tài chính giỏi, quyết đoán, có tầm nhìn',
            weaknesses: 'Ham vật chất, độc đoán, căng thẳng',
            career: 'Doanh nhân, ngân hàng, quản lý cấp cao, bất động sản',
            love: 'Cần đối tác mạnh mẽ và đồng đẳng',
            color: '#8B4513'
        },
        9: {
            title: '🌍 Số 9 - Người Nhân Đạo',
            personality: 'Bao dung, từ bi, lý t상, hoàn hảo',
            strengths: 'Rộng lượng, giúp đỡ người khác, có tầm nhìn toàn cầu',
            weaknesses: 'Thiếu thực tế, dễ bị lợi dụng, đòi hỏi cao',
            career: 'Từ thiện, giáo dục, nghệ thuật, y tế, phi lợi nhuận',
            love: 'Yêu thương vô điều kiện',
            color: '#FFD700'
        },
        11: {
            title: '✨ Số 11 - Số Master - Người Truyền Cảm Hứng',
            personality: 'Trực giác siêu phàm, nhạy cảm, có tầm nhìn',
            strengths: 'Tinh thần cao, truyền cảm hứng, sáng tạo đột phá',
            weaknesses: 'Căng thẳng cao, lo âu, khó đạt tiêu chuẩn của bản thân',
            career: 'Diễn giả, nhà tâm linh, nghệ sĩ, nhà tư tưởng',
            love: 'Cần kết nối tâm hồn sâu sắc',
            color: '#C0C0C0'
        },
        22: {
            title: '🏆 Số 22 - Số Master - Người Kiến Tạo Vĩ Đại',
            personality: 'Tầm nhìn lớn, thực tế, xây dựng di sản',
            strengths: 'Biến ước mơ thành hiện thực, tác động lớn đến xã hội',
            weaknesses: 'Áp lực cao, căng thẳng, khó đạt được mục tiêu',
            career: 'Kiến trúc sư lớn, doanh nhân quốc tế, nhà từ thiện',
            love: 'Cần đối tác hỗ trợ tầm nhìn lớn',
            color: '#FFD700'
        },
        33: {
            title: '🙏 Số 33 - Số Master - Người Thầy Vĩ Đại',
            personality: 'Tình yêu vô điều kiện, hy sinh, chữa lành',
            strengths: 'Khả năng chữa lành, giúp đỡ nhân loại, tình yêu thương cao cả',
            weaknesses: 'Gánh nặng quá lớn, hy sinh bản thân quá mức',
            career: 'Nhà tâm linh, nhà trị liệu, giáo viên vĩ đại',
            love: 'Yêu thương toàn nhân loại',
            color: '#FF1493'
        }
    };
    
    return meanings[number] || meanings[1];
}

// Hàm tính tương hợp giữa hai số
function calculateCompatibility(num1, num2) {
    const compatibility = {
        '1-1': 70, '1-2': 60, '1-3': 80, '1-4': 50, '1-5': 85, '1-6': 65, '1-7': 55, '1-8': 75, '1-9': 70,
        '2-2': 85, '2-3': 75, '2-4': 80, '2-5': 60, '2-6': 90, '2-7': 70, '2-8': 65, '2-9': 75,
        '3-3': 80, '3-4': 55, '3-5': 90, '3-6': 85, '3-7': 60, '3-8': 70, '3-9': 85,
        '4-4': 75, '4-5': 50, '4-6': 80, '4-7': 65, '4-8': 85, '4-9': 60,
        '5-5': 70, '5-6': 65, '5-7': 75, '5-8': 60, '5-9': 80,
        '6-6': 90, '6-7': 70, '6-8': 75, '6-9': 85,
        '7-7': 80, '7-8': 65, '7-9': 75,
        '8-8': 85, '8-9': 70,
        '9-9': 90,
    };
    
    const key1 = `${num1}-${num2}`;
    const key2 = `${num2}-${num1}`;
    
    return compatibility[key1] || compatibility[key2] || 50;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('numerology')
        .setDescription('Khám phá thần số học của bạn')
        .addSubcommand(subcommand =>
            subcommand
                .setName('name')
                .setDescription('Phân tích số chủ đạo từ tên của bạn')
                .addStringOption(option =>
                    option.setName('fullname')
                        .setDescription('Nhập họ tên đầy đủ của bạn')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('birthday')
                .setDescription('Phân tích số từ ngày sinh của bạn')
                .addIntegerOption(option =>
                    option.setName('day')
                        .setDescription('Ngày sinh (1-31)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(31)
                )
                .addIntegerOption(option =>
                    option.setName('month')
                        .setDescription('Tháng sinh (1-12)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(12)
                )
                .addIntegerOption(option =>
                    option.setName('year')
                        .setDescription('Năm sinh (VD: 1990)')
                        .setRequired(true)
                        .setMinValue(1900)
                        .setMaxValue(2024)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('compatibility')
                .setDescription('Kiểm tra độ tương hợp giữa hai người')
                .addStringOption(option =>
                    option.setName('name1')
                        .setDescription('Tên người thứ nhất')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('name2')
                        .setDescription('Tên người thứ hai')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'name') {
            const fullname = interaction.options.getString('fullname');
            const lifePathNumber = calculateLifePath(fullname);
            const meaning = getNumberMeaning(lifePathNumber);

            const embed = new EmbedBuilder()
                .setColor(meaning.color)
                .setTitle(`${meaning.title}`)
                .setDescription(`**Tên:** ${fullname}\n**Số Chủ Đạo:** ${lifePathNumber}`)
                .addFields(
                    { name: '👤 Tính Cách', value: meaning.personality, inline: false },
                    { name: '💪 Điểm Mạnh', value: meaning.strengths, inline: false },
                    { name: '⚠️ Điểm Yếu', value: meaning.weaknesses, inline: false },
                    { name: '💼 Nghề Nghiệp Phù Hợp', value: meaning.career, inline: false },
                    { name: '💕 Tình Yêu', value: meaning.love, inline: false }
                )
                .setFooter({ text: 'Boo Bot • Thần Số Học • Made by Phucx' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'birthday') {
            const day = interaction.options.getInteger('day');
            const month = interaction.options.getInteger('month');
            const year = interaction.options.getInteger('year');

            // Validate ngày tháng
            const date = new Date(year, month - 1, day);
            if (date.getDate() !== day || date.getMonth() !== month - 1) {
                return interaction.reply({ 
                    content: '❌ Ngày sinh không hợp lệ! Vui lòng kiểm tra lại.', 
                    flags: 64 // InteractionResponseFlags.Ephemeral 
                });
            }

            const birthNumber = calculateBirthNumber(day, month, year);
            const meaning = getNumberMeaning(birthNumber);

            // Tính số ngày sinh đơn
            const dayNumber = day > 9 && day !== 11 && day !== 22 
                ? day.toString().split('').reduce((acc, d) => acc + parseInt(d), 0) 
                : day;

            const embed = new EmbedBuilder()
                .setColor(meaning.color)
                .setTitle(`${meaning.title}`)
                .setDescription(
                    `**Ngày Sinh:** ${day}/${month}/${year}\n` +
                    `**Số Đường Đời:** ${birthNumber}\n` +
                    `**Số Ngày Sinh:** ${dayNumber}`
                )
                .addFields(
                    { name: '👤 Tính Cách', value: meaning.personality, inline: false },
                    { name: '💪 Điểm Mạnh', value: meaning.strengths, inline: false },
                    { name: '⚠️ Điểm Yếu', value: meaning.weaknesses, inline: false },
                    { name: '💼 Nghề Nghiệp Phù Hợp', value: meaning.career, inline: false },
                    { name: '💕 Tình Yêu', value: meaning.love, inline: false }
                )
                .setFooter({ text: 'Boo Bot • Thần Số Học • Made by Phucx' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'compatibility') {
            const name1 = interaction.options.getString('name1');
            const name2 = interaction.options.getString('name2');

            const num1 = calculateLifePath(name1);
            const num2 = calculateLifePath(name2);
            const compatibility = calculateCompatibility(num1, num2);

            // Xác định màu dựa trên độ tương hợp
            let color = '#FF0000';
            let rating = '❤️';
            let message = '';

            if (compatibility >= 90) {
                color = '#00FF00';
                rating = '💚💚💚💚💚';
                message = 'Cực kỳ tương hợp! Cặp đôi hoàn hảo!';
            } else if (compatibility >= 75) {
                color = '#90EE90';
                rating = '💚💚💚💚';
                message = 'Rất tương hợp! Mối quan hệ tốt đẹp!';
            } else if (compatibility >= 60) {
                color = '#FFFF00';
                rating = '💛💛💛';
                message = 'Khá tương hợp! Có tiềm năng phát triển!';
            } else if (compatibility >= 50) {
                color = '#FFA500';
                rating = '🧡🧡';
                message = 'Tương hợp trung bình. Cần nỗ lực!';
            } else {
                color = '#FF0000';
                rating = '❤️';
                message = 'Ít tương hợp. Nhiều thử thách!';
            }

            const meaning1 = getNumberMeaning(num1);
            const meaning2 = getNumberMeaning(num2);

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle('💕 Phân Tích Độ Tương Hợp')
                .setDescription(
                    `**${name1}** (Số ${num1}) ❤️ **${name2}** (Số ${num2})\n\n` +
                    `${rating}\n` +
                    `**Độ Tương Hợp:** ${compatibility}%\n` +
                    `**Đánh Giá:** ${message}`
                )
                .addFields(
                    { 
                        name: `📊 ${name1} - Số ${num1}`, 
                        value: `**Tính cách:** ${meaning1.personality}\n**Điểm mạnh:** ${meaning1.strengths}`, 
                        inline: false 
                    },
                    { 
                        name: `📊 ${name2} - Số ${num2}`, 
                        value: `**Tính cách:** ${meaning2.personality}\n**Điểm mạnh:** ${meaning2.strengths}`, 
                        inline: false 
                    }
                )
                .setFooter({ text: 'Boo Bot • Thần Số Học • Made by Phucx • Chỉ để tham khảo!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
};
