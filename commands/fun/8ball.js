const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Hỏi quả cầu thần số 8 một câu hỏi')
        .addStringOption(option => 
            option.setName('question')
                .setDescription('Câu hỏi bạn muốn hỏi')
                .setRequired(true)),
    
    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
        const responses = [
            // Câu trả lời tích cực
            "🏆 Chắc chắn rồi!",
            "🏆 Không có nghi ngờ gì cả.",
            "🏆 Tất nhiên là có.",
            "🏆 Bạn có thể tin tưởng vào điều đó.",
            "🏆 Theo tôi thấy thì có.",
            "🏆 Có khả năng cao.",
            "🏆 Triển vọng tốt.",
            "🏆 Có, chắc chắn.",
            "🏆 Dấu hiệu chỉ ra là có.",
            "🏆 Đáp án là có.",
            "🏆 Tất nhiên rồi!",
            "🏆 Đúng vậy!",
            "🏆 Triển thôi!",
            "🏆 Gó!",
            "🏆 Cắt đi luôn!",
            
            // Câu trả lời trung tính
            "🟡 Hỏi lại sau đi.",
            "🟡 Không thể dự đoán được bây giờ.",
            "🟡 Tốt hơn là đừng nói cho bạn bây giờ.",
            "🟡 Không thể đoán được.",
            "🟡 Hãy tập trung và hỏi lại.",
            "🟡 Hơi khó nói...",
            "🟡 Có thể có, có thể không.",
            "🟡 Hãy suy nghĩ lại đi.",
            "🟡 Chưa rõ lắm...",
            "🟡 Thử hỏi theo cách khác xem.",
            "🟡 Chưa thể kết luận.",
            "🟡 Tùy tình huống thôi.",
            "🟡 Để mà xem...",
            
            // Câu trả lời tiêu cực  
            "🔴 Đừng mơ nữa.",
            "🔴 Câu trả lời của tôi là không.",
            "🔴 Các nguồn tin của tôi nói không.",
            "🔴 Triển vọng không tốt lắm.",
            "🔴 Rất khó xảy ra.",
            "🔴 Không đâu.",
            "🔴 Không có khả năng.",
            "🔴 Chắc chắn là không.",
            "🔴 Tôi nghĩ là không.",
            "🔴 Khả năng rất thấp.",
            "🔴 Không thể nào!",
            "🔴 Đừng có mơ!",
            "🔴 Tuyệt đối không!",
            "🔴 Quên đi!"
        ];

        const question = interaction.options.getString('question');
        const response = responses[Math.floor(Math.random() * responses.length)];

        const embed = new EmbedBuilder()
            .setColor('#4B0082')
            .setTitle('🎱 Quả Cầu Thần Số 8')
            .addFields(
                { name: '❓ Câu hỏi:', value: `*${question}*`, inline: false },
                { name: '🔮 Câu trả lời:', value: `**${response}**`, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Yêu cầu bởi: ${interaction.user.username} • Boo Magic 8Ball`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alert!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setDescription('- This command can only be used through slash commands!\n- Please use `/8ball`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
    }
    
};

