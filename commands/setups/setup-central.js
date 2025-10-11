/*

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
                                                 
  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |\   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  
                    
DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         

Command Verified : ✓  
Website        : ssrr.tech  
Test Passed    : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { centralMusicCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');
const checkPermissions = require('../../utils/checkPermissions');
const shiva = require('../../shiva');

const COMMAND_SECURITY_TOKEN = shiva.SECURITY_TOKEN || 'DEFAULT_TOKEN';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-central')
        .setDescription('Setup the central music system in current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option.setName('voice-channel')
                .setDescription('The voice channel for music playback')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice))
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('Default volume for music playback (1-100)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(100))
        .addRoleOption(option =>
            option.setName('allowed-role')
                .setDescription('Role allowed to use music controls (leave empty for @everyone)')
                .setRequired(false)),

    async execute(interaction, client) {
        
        try {
            const guild = interaction.guild;
            const serverId = guild.id;
            const channelId = interaction.channel.id;
            const voiceChannel = interaction.options.getChannel('voice-channel');
            const volume = interaction.options.getInteger('volume') || 50;
            const allowedRole = interaction.options.getRole('allowed-role');

            // Check if user has manage channels permission
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ You need **Manage Channels** permission to use this command.');
                return interaction.reply({ embeds: [embed], flags: 64 });
            }

            try {
                // Create the central music panel embed
                const centralEmbed = new EmbedBuilder()
                    .setTitle('🎵 Central Music Control Panel')
                    .setDescription(`**Voice Channel:** ${voiceChannel}\n**Default Volume:** ${volume}%\n**Allowed Role:** ${allowedRole ? allowedRole : '@everyone'}\n\n**Status:** ⏸️ No music playing`)
                    .setColor('#00c3ff')
                    .setFooter({ text: 'Boo Music Bot - Central System', iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                // Create control buttons
                const row1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('central_play_pause')
                            .setLabel('Play/Pause')
                            .setEmoji('⏯️')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('central_skip')
                            .setLabel('Skip')
                            .setEmoji('⏭️')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('central_stop')
                            .setLabel('Stop')
                            .setEmoji('⏹️')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('central_queue')
                            .setLabel('Queue')
                            .setEmoji('📃')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('central_shuffle')
                            .setLabel('Shuffle')
                            .setEmoji('🔀')
                            .setStyle(ButtonStyle.Secondary)
                    );

                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('central_volume_down')
                            .setLabel('Vol-')
                            .setEmoji('🔉')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('central_volume_up')
                            .setLabel('Vol+')
                            .setEmoji('🔊')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('central_loop')
                            .setLabel('Loop')
                            .setEmoji('🔁')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('central_disconnect')
                            .setLabel('Disconnect')
                            .setEmoji('🚪')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('central_nowplaying')
                            .setLabel('Now Playing')
                            .setEmoji('🎶')
                            .setStyle(ButtonStyle.Success)
                    );

                // Send the central panel
                const centralMessage = await interaction.reply({
                    embeds: [centralEmbed],
                    components: [row1, row2],
                    fetchReply: true
                });

                // Save configuration to database
                await centralMusicCollection.updateOne(
                    { serverId: serverId },
                    {
                        $set: {
                            serverId: serverId,
                            channelId: channelId,
                            messageId: centralMessage.id,
                            voiceChannelId: voiceChannel.id,
                            defaultVolume: volume,
                            allowedRoleId: allowedRole?.id || null,
                            status: true,
                            createdAt: new Date(),
                            ownerId: guild.ownerId
                        }
                    },
                    { upsert: true }
                );

                // Send success message
                const successEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setDescription(`✅ **Central Music System Setup Complete!**\n\n🎵 **Voice Channel:** ${voiceChannel}\n📊 **Volume:** ${volume}%\n👥 **Allowed Role:** ${allowedRole ? allowedRole : '@everyone'}\n📍 **Control Panel:** Above this message\n\n*Use the buttons above to control music playback!*`)
                    .setFooter({ text: 'Central system is now active', iconURL: cmdIcons.correctIcon });

                await interaction.followUp({ embeds: [successEmbed], flags: 64 });

            } catch (innerError) {
                console.error('Error setting up central music system:', innerError);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ An error occurred while setting up the central music system. Please try again.');
                
                if (!interaction.replied) {
                    await interaction.reply({ embeds: [errorEmbed], flags: 64 });
                } else {
                    await interaction.editReply({ embeds: [errorEmbed] });
                }
            }
        } catch (error) {
            console.error('General error in setup-central command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An unexpected error occurred. Please try again later.');
            
            if (!interaction.replied) {
                await interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }
        }
    }
};

/*

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
                                                 
  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  
                    
DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         

Command Verified : ✓  
Website        : ssrr.tech  
Test Passed    : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/