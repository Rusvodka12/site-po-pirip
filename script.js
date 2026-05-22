document.addEventListener('DOMContentLoaded', function() {
    const userQuery = document.getElementById('user-query');
    const sendBtn = document.getElementById('send-btn');
    const loading = document.getElementById('loading');
    const responseSection = document.getElementById('response-section');
    const aiResponse = document.getElementById('ai-response');
    const copyBtn = document.getElementById('copy-btn');

    // Замените на ваш реальный API-ключ и URL
    const API_KEY = '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'; // Проверьте ключ на корректность!
    const API_URL = 'https://api.openai.com/v1/chat/completions';

    sendBtn.addEventListener('click', async function() {
        const query = userQuery.value.trim();

        if (!query) {
            alert('Пожалуйста, введите запрос!');
            return;
        }

        // Проверяем корректность API-ключа
        if (!API_KEY || API_KEY.trim() === '') {
            alert('API-ключ не задан или пуст!');
            return;
        }

        // Убираем все лишние пробелы из API-ключа
        const cleanedAPIKey = API_KEY.trim();

        // Показываем индикатор загрузки
        loading.classList.remove('hidden');
        responseSection.classList.add('hidden');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cleanedAPIKey}` // Ключевой момент — Bearer + ключ без пробелов
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo', // или другая модель
                    messages: [{ role: 'user', content: query }],
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'Неизвестная ошибка'}`);
            }

            const data = await response.json();
            const aiText = data.choices.message.content; // Уточнили индексацию choices

            // Отображаем ответ
            aiResponse.textContent = aiText;
            loading.classList.add('hidden');
            responseSection.classList.remove('hidden');

        } catch (error) {
            console.error('Ошибка:', error);
            let errorMessage = 'Произошла ошибка при получении ответа от ИИ. Попробуйте ещё раз.';

            // Дополнительные детали об ошибке
            if (error.message.includes('401') || error.message.includes('Missing')) {
                errorMessage = 'Ошибка аутентификации. Проверьте API-ключ — он должен быть корректным и без лишних пробелов.';
            } else if (error.message.includes('429')) {
                errorMessage = 'Превышен лимит запросов. Попробуйте позже.';
            }

            alert(errorMessage);
            loading.classList.add('hidden');
        }
    });

    copyBtn.addEventListener('click', function() {
        if (!aiResponse.textContent.trim()) {
            alert('Нет текста для копирования!');
            return;
        }

        navigator.clipboard.writeText(aiResponse.textContent)
            .then(() => {
                alert('Ответ скопирован в буфер обмена!');
            })
            .catch(err => {
                console.error('Ошибка копирования:', err);
                alert('Не удалось скопировать текст');
            });
    });
});
