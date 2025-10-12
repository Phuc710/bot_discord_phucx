// Test script for message splitting functionality

// Split long text into chunks that fit Discord's 2000 character limit
function splitTextIntoChunks(text, maxLength = 2000) {
    if (text.length <= maxLength) {
        return [text];
    }
    
    const chunks = [];
    let currentChunk = '';
    
    // Split by lines to avoid breaking in the middle of sentences
    const lines = text.split('\n');
    
    for (const line of lines) {
        // If single line is too long, force split it
        if (line.length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = '';
            }
            
            // Split the long line
            for (let i = 0; i < line.length; i += maxLength) {
                chunks.push(line.substring(i, i + maxLength));
            }
            continue;
        }
        
        // Check if adding this line would exceed limit
        if ((currentChunk + line + '\n').length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = line + '\n';
        } else {
            currentChunk += line + '\n';
        }
    }
    
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

// Test cases
console.log('🧪 Testing message splitting functionality...\n');

// Test 1: Short message (should not split)
const shortMessage = 'Hello, this is a short message!';
const shortResult = splitTextIntoChunks(shortMessage);
console.log('✅ Test 1: Short message');
console.log(`   Original length: ${shortMessage.length}`);
console.log(`   Chunks: ${shortResult.length}`);
console.log(`   Max chunk length: ${Math.max(...shortResult.map(c => c.length))}\n`);

// Test 2: Long message with HTML code (like the error case)
const longHtmlMessage = `Chào bạn! Bạn muốn code HTML cho trang đăng ký phải không? Đây là một ví dụ đơn giản bạn có thể dùng nhé:

\`\`\`html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đăng Ký</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .register-container {
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            width: 350px;
            text-align: center;
        }
        .register-container h2 {
            margin-bottom: 25px;
            color: #333;
        }
        .form-group {
            margin-bottom: 15px;
            text-align: left;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-weight: bold;
        }
        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="password"] {
            width: calc(100% - 20px);
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        .form-group input[type="submit"] {
            width: 100%;
            padding: 12px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 17px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            margin-top: 10px;
        }
        .form-group input[type="submit"]:hover {
            background-color: #0056b3;
        }
        .login-link {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
        }
        .login-link a {
            color: #007bff;
            text-decoration: none;
        }
        .login-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="register-container">
        <h2>Đăng Ký Tài Khoản</h2>
        <form action="/register" method="POST">
            <div class="form-group">
                <label for="username">Tên người dùng:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Mật khẩu:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
                <label for="confirm_password">Xác nhận mật khẩu:</label>
                <input type="password" id="confirm_password" name="confirm_password" required>
            </div>
            <div class="form-group">
                <input type="submit" value="Đăng Ký">
            </div>
        </form>
        <div class="login-link">
            Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
        </div>
    </div>
</body>
</html>
\`\`\`

Bạn có thể copy code này và chỉnh sửa theo ý thích nhé! 🎨`;

const longResult = splitTextIntoChunks(longHtmlMessage);
console.log('✅ Test 2: Long HTML message (like the error case)');
console.log(`   Original length: ${longHtmlMessage.length}`);
console.log(`   Chunks: ${longResult.length}`);
longResult.forEach((chunk, i) => {
    console.log(`   Chunk ${i + 1} length: ${chunk.length} ${chunk.length > 2000 ? '❌ TOO LONG!' : '✅'}`);
});
console.log();

// Test 3: Very long single line
const veryLongLine = 'A'.repeat(5000);
const veryLongResult = splitTextIntoChunks(veryLongLine);
console.log('✅ Test 3: Very long single line (5000 chars)');
console.log(`   Original length: ${veryLongLine.length}`);
console.log(`   Chunks: ${veryLongResult.length}`);
console.log(`   Max chunk length: ${Math.max(...veryLongResult.map(c => c.length))}\n`);

// Verify all chunks are within limit
const allChunksValid = longResult.every(chunk => chunk.length <= 2000);
console.log(`\n🎯 Result: ${allChunksValid ? '✅ All chunks are within 2000 character limit!' : '❌ Some chunks exceed limit!'}`);
