const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Настройка транспортера для отправки email с реальными данными
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'tetrixuno@gmail.com',
        pass: process.env.EMAIL_PASS || 'wzjmuggqqmxolrhl'
    }
});

// Функция для генерации случайного кода подтверждения
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Маршрут для отправки кода подтверждения
app.post('/send-verification', async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        // Генерируем код подтверждения
        const verificationCode = generateVerificationCode();
        // Настройки письма
        const mailOptions = {
            from: 'tetrixuno@gmail.com',
            to: email,
            subject: '📱 SMS-код подтверждения - Образовательная платформа A-K Project',
            html: `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; box-sizing: border-box;">
    <div style="background: white; padding: 30px 20px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; margin-left: auto; margin-right: auto;">
                <span style="color: white; font-size: 28px;">📱</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; color: #333; font-weight: 700;">SMS-код подтверждения</h1>
            <p style="margin: 8px 0 0 0; color: #666; font-size: 15px;">Образовательная платформа A-K Project</p>
        </div>
        <div style="margin-bottom: 25px;">
            <h2 style="color: #333; margin-bottom: 12px; font-size: 20px;">Здравствуйте${firstName ? `, ${firstName}` : ''}! 👋</h2>
            <p style="color: #666; line-height: 1.5; font-size: 15px; margin-bottom: 20px;">
                Спасибо за регистрацию на нашей образовательной платформе A-K Project!
                Для завершения регистрации введите следующий SMS-код подтверждения:
            </p>
            <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%); border: 3px solid #667eea; border-radius: 15px; padding: 20px; text-align: center; margin: 25px 0; position: relative; overflow: hidden; box-sizing: border-box;">
                <div style="position: absolute; top: -40px; right: -40px; width: 80px; height: 80px; background: rgba(102, 126, 234, 0.1); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: -20px; left: -20px; width: 50px; height: 50px; background: rgba(118, 75, 162, 0.1); border-radius: 50%;"></div>
                <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 6px; font-family: 'Courier New', monospace; position: relative; z-index: 1; margin: 10px 0;">
                    ${verificationCode}
                </div>
                <p style="margin: 12px 0 0 0; color: #888; font-size: 13px; position: relative; z-index: 1;">
                    ⏰ Код действителен в течение 15 минут
                </p>
            </div>
        </div>
        <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 12px 15px; border-radius: 5px; margin: 20px 0; box-sizing: border-box;">
            <p style="margin: 0; color: #b8860b; font-size: 13px; line-height: 1.4;">
                🛡️ <strong>Безопасность:</strong> Если вы не регистрировались на платформе A-K Project, просто проигнорируйте это письмо.
            </p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center;">
            <p style="color: #888; font-size: 12px; margin: 0; line-height: 1.4;">
                С уважением,<br>
                <strong style="color: #667eea;">Команда A-K Project</strong> 🎓
            </p>
        </div>
    </div>
</div>
            `,
            text: `
                SMS-код подтверждения - Образовательная платформа A-K Project
                Здравствуйте${firstName ? `, ${firstName}` : ''}!
                Спасибо за регистрацию на образовательной платформе A-K Project!
                Для завершения регистрации введите следующий SMS-код подтверждения: ${verificationCode}
                Код действителен в течение 15 минут.
                Если вы не регистрировались на платформе A-K Project, просто проигнорируйте это письмо.
                С уважением,
                Команда A-K Project
            `
        };
        // Отправляем письмо
        const info = await transporter.sendMail(mailOptions);
        console.log('SMS-код отправлен успешно:', info.messageId);
        console.log('Verification code for', email, ':', verificationCode);
        res.json({ 
            success: true, 
            message: 'SMS-код подтверждения отправлен на почту',
            verificationCode: verificationCode, // В продакшене это не должно возвращаться!
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Ошибка отправки SMS-кода:', error);
        res.status(500).json({ 
            error: 'Не удалось отправить SMS-код подтверждения',
            details: error.message 
        });
    }
});

// Маршрут для уведомлений о новых заданиях
app.post('/send-new-assignment', async (req, res) => {
    try {
        const { 
            studentEmail, 
            studentName, 
            assignmentTitle, 
            assignmentDescription, 
            teacherName, 
            dueDate,
            maxScore 
        } = req.body;
        if (!studentEmail || !assignmentTitle) {
            return res.status(400).json({ error: 'Student email and assignment title are required' });
        }
        const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Не указан';
        const mailOptions = {
            from: 'tetrixuno@gmail.com',
            to: studentEmail,
            subject: `📚 Новое задание: ${assignmentTitle} - A-K Project`,
            html: `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); border-radius: 15px; box-sizing: border-box;">
    <div style="background: white; padding: 30px 20px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; margin-left: auto; margin-right: auto;">
                <span style="color: white; font-size: 28px;">📚</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; color: #333; font-weight: 700;">Новое задание!</h1>
            <p style="margin: 8px 0 0 0; color: #666; font-size: 15px;">Образовательная платформа A-K Project</p>
        </div>
        <div style="margin-bottom: 25px;">
            <h2 style="color: #333; margin-bottom: 12px; font-size: 20px;">Здравствуйте${studentName ? `, ${studentName}` : ''}! 👋</h2>
            <p style="color: #666; line-height: 1.5; font-size: 15px; margin-bottom: 20px;">
                Для вас добавлено новое задание. Не пропустите возможность показать свои знания!
            </p>
            <div style="background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%); border: 3px solid #4CAF50; border-radius: 15px; padding: 20px; margin: 25px 0; position: relative; overflow: hidden; box-sizing: border-box;">
                <div style="position: absolute; top: -40px; right: -40px; width: 80px; height: 80px; background: rgba(76, 175, 80, 0.1); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: -20px; left: -20px; width: 50px; height: 50px; background: rgba(46, 125, 50, 0.1); border-radius: 50%;"></div>
                <h3 style="color: #2E7D32; margin: 0 0 12px 0; font-size: 22px; position: relative; z-index: 1;">
                    📝 ${assignmentTitle}
                </h3>
                <p style="color: #333; line-height: 1.5; margin: 0 0 18px 0; position: relative; z-index: 1; font-size: 15px;">
                    ${assignmentDescription}
                </p>
                <div style="display: flex; flex-wrap: wrap; gap: 12px; position: relative; z-index: 1;">
                    <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); flex: 1 1 100%; min-width: 100px; box-sizing: border-box;">
                        <div style="color: #4CAF50; font-size: 11px; font-weight: bold; margin-bottom: 4px;">ПРЕПОДАВАТЕЛЬ</div>
                        <div style="color: #333; font-weight: 600; font-size: 14px;">${teacherName || 'Не указан'}</div>
                    </div>
                    <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); flex: 1 1 100%; min-width: 100px; box-sizing: border-box;">
                        <div style="color: #4CAF50; font-size: 11px; font-weight: bold; margin-bottom: 4px;">СРОК СДАЧИ</div>
                        <div style="color: #333; font-weight: 600; font-size: 14px;">${formattedDueDate}</div>
                    </div>
                    <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); flex: 1 1 100%; min-width: 100px; box-sizing: border-box;">
                        <div style="color: #4CAF50; font-size: 11px; font-weight: bold; margin-bottom: 4px;">МАКС. БАЛЛ</div>
                        <div style="color: #333; font-weight: 600; font-size: 14px;">${maxScore || 100}</div>
                    </div>
                </div>
            </div>
        </div>
        <div style="text-align: center; margin: 25px 0;">
            <a href="http://localhost:5173" style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3); box-sizing: border-box;">
                🚀 Приступить к выполнению
            </a>
        </div>
        <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 12px 15px; border-radius: 5px; margin: 20px 0; box-sizing: border-box;">
            <p style="margin: 0; color: #1565C0; font-size: 13px; line-height: 1.4;">
                💡 <strong>Совет:</strong> Начните выполнение как можно раньше, чтобы успеть задать вопросы преподавателю.
            </p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center;">
            <p style="color: #888; font-size: 12px; margin: 0; line-height: 1.4;">
                С уважением,<br>
                <strong style="color: #4CAF50;">Команда A-K Project</strong> 🎓
            </p>
        </div>
    </div>
</div>
            `,
            text: `
                Новое задание - ${assignmentTitle} - A-K Project
                Здравствуйте${studentName ? `, ${studentName}` : ''}!
                Для вас добавлено новое задание на платформе A-K Project:
                Название: ${assignmentTitle}
                Описание: ${assignmentDescription}
                Преподаватель: ${teacherName || 'Не указан'}
                Срок сдачи: ${formattedDueDate}
                Максимальный балл: ${maxScore || 100}
                Перейдите на платформу для выполнения: http://localhost:5173
                С уважением,
                Команда A-K Project
            `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Уведомление о новом задании отправлено:', info.messageId);
        res.json({ 
            success: true, 
            message: 'Уведомление о новом задании отправлено',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Ошибка отправки уведомления о задании:', error);
        res.status(500).json({ 
            error: 'Не удалось отправить уведомление о задании',
            details: error.message 
        });
    }
});

// Маршрут для уведомлений о выставлении оценок
app.post('/send-grade-notification', async (req, res) => {
    try {
        const { 
            studentEmail, 
            studentName, 
            assignmentTitle,
            score,
            maxScore,
            feedback,
            teacherName 
        } = req.body;
        if (!studentEmail || !assignmentTitle || score === undefined) {
            return res.status(400).json({ error: 'Student email, assignment title and score are required' });
        }
        const percentage = Math.round((score / (maxScore || 100)) * 100);
        const gradeEmoji = percentage >= 90 ? '🌟' : percentage >= 80 ? '🎉' : percentage >= 70 ? '👍' : percentage >= 60 ? '📝' : '📚';
        const gradeColor = percentage >= 80 ? '#4CAF50' : percentage >= 60 ? '#FF9800' : '#f44336';
        const mailOptions = {
            from: 'tetrixuno@gmail.com',
            to: studentEmail,
            subject: `${gradeEmoji} Оценка за задание: ${assignmentTitle} - A-K Project`,
            html: `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%); border-radius: 15px; box-sizing: border-box;">
    <div style="background: white; padding: 30px 20px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, ${gradeColor} 0%, ${gradeColor}CC 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; margin-left: auto; margin-right: auto;">
                <span style="color: white; font-size: 28px;">${gradeEmoji}</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; color: #333; font-weight: 700;">Задание оценено!</h1>
            <p style="margin: 8px 0 0 0; color: #666; font-size: 15px;">Образовательная платформа A-K Project</p>
        </div>
        <div style="margin-bottom: 25px;">
            <h2 style="color: #333; margin-bottom: 12px; font-size: 20px;">Здравствуйте${studentName ? `, ${studentName}` : ''}! 👋</h2>
            <p style="color: #666; line-height: 1.5; font-size: 15px; margin-bottom: 20px;">
                Ваше задание проверено и оценено! Посмотрите результат:
            </p>
            <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%); border: 3px solid ${gradeColor}; border-radius: 15px; padding: 20px; margin: 25px 0; position: relative; overflow: hidden; box-sizing: border-box;">
                <div style="position: absolute; top: -40px; right: -40px; width: 80px; height: 80px; background: rgba(255, 107, 107, 0.1); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: -20px; left: -20px; width: 50px; height: 50px; background: rgba(78, 205, 196, 0.1); border-radius: 50%;"></div>
                <h3 style="color: #333; margin: 0 0 12px 0; font-size: 22px; position: relative; z-index: 1;">
                    📝 ${assignmentTitle}
                </h3>
                <div style="text-align: center; margin: 20px 0; position: relative; z-index: 1;">
                    <div style="display: inline-block; background: ${gradeColor}; color: white; padding: 18px 25px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); box-sizing: border-box;">
                        <div style="font-size: 42px; font-weight: bold; margin: 0;">${score}</div>
                        <div style="font-size: 16px; margin: 4px 0;">из ${maxScore || 100}</div>
                        <div style="background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; margin-top: 8px; font-size: 14px;">
                            ${percentage}%
                        </div>
                    </div>
                </div>
                ${feedback ? `
                <div style="background: white; padding: 18px; border-radius: 10px; border-left: 5px solid ${gradeColor}; margin: 18px 0; position: relative; z-index: 1; box-sizing: border-box;">
                    <h4 style="color: ${gradeColor}; margin: 0 0 8px 0; font-size: 15px;">💬 Обратная связь от преподавателя:</h4>
                    <p style="color: #333; line-height: 1.5; margin: 0; font-style: italic; font-size: 14px;">"${feedback}"</p>
                </div>
                ` : ''}
                ${teacherName ? `
                <div style="text-align: right; position: relative; z-index: 1; margin-top: 18px;">
                    <span style="color: #666; font-size: 13px;">Преподаватель: <strong>${teacherName}</strong></span>
                </div>
                ` : ''}
            </div>
        </div>
        <div style="text-align: center; margin: 25px 0;">
            <a href="http://localhost:5173" style="background: linear-gradient(135deg, ${gradeColor} 0%, ${gradeColor}CC 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); box-sizing: border-box;">
                📊 Посмотреть детали
            </a>
        </div>
        <div style="background: #e8f5e8; border-left: 4px solid #4CAF50; padding: 12px 15px; border-radius: 5px; margin: 20px 0; box-sizing: border-box;">
            <p style="margin: 0; color: #2E7D32; font-size: 13px; line-height: 1.4;">
                ${percentage >= 80 ?
                    '🎊 <strong>Отличная работа!</strong> Продолжайте в том же духе!' :
                    percentage >= 60 ?
                    '👍 <strong>Хорошо!</strong> Есть куда расти, но вы на правильном пути!' :
                    '📚 <strong>Не расстраивайтесь!</strong> Ошибки - это возможность научиться. Обратитесь за помощью к преподавателю.'
                }
            </p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center;">
            <p style="color: #888; font-size: 12px; margin: 0; line-height: 1.4;">
                С уважением,<br>
                <strong style="color: ${gradeColor};">Команда A-K Project</strong> 🎓
            </p>
        </div>
    </div>
</div>
            `,
            text: `
                Оценка за задание - ${assignmentTitle} - A-K Project
                Здравствуйте${studentName ? `, ${studentName}` : ''}!
                Ваше задание на платформе A-K Project оценено:
                Задание: ${assignmentTitle}
                Оценка: ${score} из ${maxScore || 100} (${percentage}%)
                ${feedback ? `Обратная связь: ${feedback}` : ''}
                ${teacherName ? `Преподаватель: ${teacherName}` : ''}
                Перейдите на платформу для просмотра деталей: http://localhost:5173
                С уважением,
                Команда A-K Project
            `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Уведомление об оценке отправлено:', info.messageId);
        res.json({ 
            success: true, 
            message: 'Уведомление об оценке отправлено',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Ошибка отправки уведомления об оценке:', error);
        res.status(500).json({ 
            error: 'Не удалось отправить уведомление об оценке',
            details: error.message 
        });
    }
});

// Маршрут для отправки письма восстановления пароля
app.post('/send-password-reset', async (req, res) => {
    try {
        const { email, firstName, resetToken } = req.body;
        if (!email || !resetToken) {
            return res.status(400).json({ error: 'Email and reset token are required' });
        }
        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: 'tetrixuno@gmail.com',
            to: email,
            subject: '🔐 Восстановление пароля - Образовательная платформа A-K Project',
            html: `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 15px; box-sizing: border-box;">
    <div style="background: white; padding: 30px 20px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; margin-left: auto; margin-right: auto;">
                <span style="color: white; font-size: 28px;">🔐</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; color: #333; font-weight: 700;">Восстановление пароля</h1>
            <p style="margin: 8px 0 0 0; color: #666; font-size: 15px;">Образовательная платформа A-K Project</p>
        </div>
        <div style="margin-bottom: 25px;">
            <h2 style="color: #333; margin-bottom: 12px; font-size: 20px;">Здравствуйте${firstName ? `, ${firstName}` : ''}! 👋</h2>
            <p style="color: #666; line-height: 1.5; font-size: 15px; margin-bottom: 20px;">
                Вы запросили восстановление пароля для вашего аккаунта на образовательной платформе A-K Project.
            </p>
            <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 14px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 5px 15px rgba(240, 147, 251, 0.3); box-sizing: border-box;">
                    🔑 Восстановить пароль
                </a>
            </div>
            <p style="color: #666; line-height: 1.5; font-size: 13px;">
                Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br>
                <a href="${resetUrl}" style="color: #f5576c; word-break: break-all; font-size: 13px;">${resetUrl}</a>
            </p>
        </div>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 12px 15px; margin: 18px 0; box-sizing: border-box;">
            <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.4;">
                ⚠️ Эта ссылка действительна в течение 1 часа.
                Если вы не запрашивали восстановление пароля на платформе A-K Project, просто проигнорируйте это письмо.
            </p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center;">
            <p style="color: #888; font-size: 12px; margin: 0; line-height: 1.4;">
                С уважением,<br>
                <strong style="color: #f5576c;">Команда A-K Project</strong> 🎓
            </p>
        </div>
    </div>
</div>
            `,
            text: `
                Восстановление пароля - Образовательная платформа A-K Project
                Здравствуйте${firstName ? `, ${firstName}` : ''}!
                Вы запросили восстановление пароля для вашего аккаунта на платформе A-K Project.
                Перейдите по ссылке для восстановления: ${resetUrl}
                Эта ссылка действительна в течение 1 часа.
                Если вы не запрашивали восстановление пароля на платформе A-K Project, просто проигнорируйте это письмо.
                С уважением,
                Команда A-K Project
            `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully:', info.messageId);
        res.json({ 
            success: true, 
            message: 'Password reset email sent successfully',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).json({ 
            error: 'Failed to send password reset email',
            details: error.message 
        });
    }
});

// Проверка здоровья сервиса
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Email Service', timestamp: new Date().toISOString() });
});

// Export the Express app for Vercel
module.exports = app;