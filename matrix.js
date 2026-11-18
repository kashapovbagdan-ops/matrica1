(() => {
  'use strict';

  /**
   * 22 старших аркана: краткие значения для калькулятора.
   * Тексты намеренно даны в двух полюсах — ресурс и тень.
   */
  const ARCANA = [
    {
      number: 1,
      name: 'Маг',
      keywords: ['воля', 'слово', 'мастерство'],
      plus: 'Инициатива, ясная речь, умение договариваться и превращать идею в действие.',
      minus: 'Манипуляции, пустые обещания, хвастовство и страх показать настоящий талант.',
    },
    {
      number: 2,
      name: 'Жрица',
      keywords: ['интуиция', 'знание', 'тишина'],
      plus: 'Глубина, наблюдательность, доступ к скрытой информации и умение ждать подходящий момент.',
      minus: 'Закрытость, иллюзии, подозрительность и жизнь в чужих ожиданиях.',
    },
    {
      number: 3,
      name: 'Императрица',
      keywords: ['творчество', 'забота', 'изобилие'],
      plus: 'Вкус, плодородие, умение создавать уют и притягивать ресурс в свою жизнь.',
      minus: 'Гиперопека, расточительность, зависть или привычка жить за счёт других.',
    },
    {
      number: 4,
      name: 'Император',
      keywords: ['порядок', 'власть', 'опора'],
      plus: 'Структура, ответственность, защита близких и умение управлять процессом.',
      minus: 'Жёсткость, тотальный контроль, подавление других и страх потерять власть.',
    },
    {
      number: 5,
      name: 'Иерофант',
      keywords: ['обучение', 'традиции', 'смысл'],
      plus: 'Наставничество, глубокая вера, умение объяснять и вести за собой.',
      minus: 'Догмы, морализаторство, отрицание чужого опыта и страх перемен.',
    },
    {
      number: 6,
      name: 'Влюблённые',
      keywords: ['любовь', 'выбор', 'союз'],
      plus: 'Партнёрство, обаяние, умение слышать другого и делать честный выбор.',
      minus: 'Зависимость, ревность, сомнения и страх остаться одному.',
    },
    {
      number: 7,
      name: 'Колесница',
      keywords: ['движение', 'победа', 'цель'],
      plus: 'Целеустремлённость, скорость, харизма и умение довести дело до результата.',
      minus: 'Спешка, борьба со всеми, самовольство и выгорание.',
    },
    {
      number: 8,
      name: 'Справедливость',
      keywords: ['закон', 'баланс', 'договор'],
      plus: 'Честность, логика, умение договариваться и видеть последствия своих решений.',
      minus: 'Категоричность, суд над другими, холодность и страх ошибки.',
    },
    {
      number: 9,
      name: 'Отшельник',
      keywords: ['мудрость', 'уединение', 'поиск'],
      plus: 'Глубина, самостоятельность, духовный поиск и умение быть наедине с собой.',
      minus: 'Изоляция, занудство, побег от людей и депрессивные сценарии.',
    },
    {
      number: 10,
      name: 'Колесо Фортуны',
      keywords: ['удача', 'циклы', 'поток'],
      plus: 'Лёгкость, умение ловить момент, гибкость и доверие к жизни.',
      minus: 'Фатализм, нестабильность, зависимость от обстоятельств и азарт.',
    },
    {
      number: 11,
      name: 'Сила',
      keywords: ['сила духа', 'страсть', 'терпение'],
      plus: 'Выдержка, харизма, умение управлять инстинктами и вдохновлять других.',
      minus: 'Агрессия, подавление чувств, властность или роль жертвы.',
    },
    {
      number: 12,
      name: 'Повешенный',
      keywords: ['пауза', 'взгляд', 'трансформация'],
      plus: 'Смирение, смена ракурса, глубина и умение вовремя отпустить.',
      minus: 'Застревание, роль жертвы, промедление и страх сделать шаг.',
    },
    {
      number: 13,
      name: 'Смерть',
      keywords: ['завершение', 'обновление', 'очищение'],
      plus: 'Умение завершать, трансформироваться и начинать заново.',
      minus: 'Страх перемен, разрушение и цепляние за прошлое.',
    },
    {
      number: 14,
      name: 'Умеренность',
      keywords: ['баланс', 'исцеление', 'алхимия'],
      plus: 'Гармония, чувство меры, целительство и умение соединять противоположности.',
      minus: 'Крайности, нетерпение, хаотичные перемены и потеря внутреннего центра.',
    },
    {
      number: 15,
      name: 'Дьявол',
      keywords: ['страсть', 'материя', 'искушение'],
      plus: 'Магнетизм, сексуальность, умение зарабатывать и держать внимание.',
      minus: 'Зависимости, контроль, ревность и жизнь ради удовольствий.',
    },
    {
      number: 16,
      name: 'Башня',
      keywords: ['прорыв', 'кризис', 'свобода'],
      plus: 'Смелость, честность, способность разрушить ложное и начать новое.',
      minus: 'Разрушение, конфликты, резкие падения и страх стабильности.',
    },
    {
      number: 17,
      name: 'Звезда',
      keywords: ['надежда', 'вдохновение', 'слава'],
      plus: 'Вера, талант, лёгкость, умение вдохновлять и быть на виду.',
      minus: 'Иллюзии, гордыня, разочарование и страх проявляться.',
    },
    {
      number: 18,
      name: 'Луна',
      keywords: ['интуиция', 'тайна', 'подсознание'],
      plus: 'Воображение, эмпатия, глубина и умение чувствовать скрытое.',
      minus: 'Тревога, обман, зависимости и жизнь в иллюзиях.',
    },
    {
      number: 19,
      name: 'Солнце',
      keywords: ['радость', 'успех', 'лидерство'],
      plus: 'Энергия, оптимизм, признание и умение вести людей за собой.',
      minus: 'Эго, выгорание и потребность в постоянном восхищении.',
    },
    {
      number: 20,
      name: 'Суд',
      keywords: ['пробуждение', 'призвание', 'род'],
      plus: 'Ясность, связь с родом, умение слышать зов и возрождаться.',
      minus: 'Чувство вины, зависимость от прошлого и страх публичности.',
    },
    {
      number: 21,
      name: 'Мир',
      keywords: ['целостность', 'масштаб', 'завершение'],
      plus: 'Широта, успех, умение видеть картину целиком и завершать циклы.',
      minus: 'Страх финала, разбрасывание, потеря смысла и границ.',
    },
    {
      number: 22,
      name: 'Шут',
      keywords: ['свобода', 'начало', 'риск'],
      plus: 'Лёгкость, спонтанность, открытость новому и умение начинать с нуля.',
      minus: 'Безответственность, хаос, побег от обязательств и глупость.',
    },
  ];

  const BY_NUMBER = new Map(ARCANA.map((arcana) => [arcana.number, arcana]));

  /**
   * Смысл точки важнее самого числа: один и тот же аркан в разных
   * позициях читается по-разному.
   */
  const POSITIONS = {
    A: {
      label: 'День рождения',
      title: 'Портрет личности',
      meaning: 'Ваша визитная карточка: как вас считывают люди и на что вы опираетесь в трудный момент.',
      advice: 'Развивайте сильные стороны этой энергии и замечайте, когда уходите в её тень.',
    },
    B: {
      label: 'Месяц рождения',
      title: 'Талант и поддержка',
      meaning: 'Связь с вдохновением, интуицией и высшей поддержкой. Через неё приходят идеи и люди.',
      advice: 'Давайте себе время на тишину и творчество — здесь приходит поддержка.',
    },
    C: {
      label: 'Год рождения',
      title: 'Задача души и деньги',
      meaning: 'Материальная карма: через неё приходят деньги, здоровье и жизненные уроки.',
      advice: 'Деньги и здоровье выравниваются, когда вы учитесь у этой энергии, а не ждёте чуда.',
    },
    D: {
      label: 'Нижний угол',
      title: 'Главная проработка',
      meaning: 'Энергия прошлых уроков. При рождении считается точкой роста, а не приговором.',
      advice: 'Не пугайтесь: это зона роста. Переводите её в плюс маленькими шагами.',
    },
    center: {
      label: 'Центр',
      title: 'Зона комфорта',
      meaning: 'Где вам спокойно и через какую энергию вас считывает общество.',
      advice: 'Создавайте вокруг себя среду, где эта энергия чувствует себя безопасно.',
    },
    moneyEntry: {
      label: 'Вход в денежный канал',
      title: 'Как приходят деньги',
      meaning: 'Что помогает деньгам приходить и что перекрывает денежный канал.',
      advice: 'Смотрите, какие действия усиливают поток, а какие создают утечку.',
    },
    moneyPoint: {
      label: 'Денежная точка',
      title: 'Дело и доход',
      meaning: 'Сфера, где доход соединяется с удовольствием от дела.',
      advice: 'Ищите занятие, в котором эта энергия раскрывается в плюсе.',
    },
    balance: {
      label: 'Точка баланса',
      title: 'Деньги и любовь',
      meaning: 'Как деньги и отношения влияют друг на друга и где спрятан главный блок.',
      advice: 'Проверьте, не платите ли вы отношениями за деньги или деньгами за любовь.',
    },
    relationshipEntry: {
      label: 'Вход в канал отношений',
      title: 'Уроки любви',
      meaning: 'Какие ошибки в отношениях нужно увидеть и какие сценарии повторяются.',
      advice: 'Учитесь замечать этот сценарий до того, как он снова начнётся.',
    },
    relationshipPoint: {
      label: 'Точка отношений',
      title: 'Партнёр и любовь',
      meaning: 'Портрет подходящего партнёра и энергия, которая делает союз ресурсным.',
      advice: 'Партнёр, у которого эта энергия в плюсе, будет для вас опорой.',
    },
    personalPurpose: {
      label: 'Личное предназначение',
      title: '20–40 лет',
      meaning: 'Задача, которую важно проявить в первой половине жизни.',
      advice: 'С 20 до 40 лет задача — проявить эту энергию в своей жизни.',
    },
    socialPurpose: {
      label: 'Социальное предназначение',
      title: '40–60 лет',
      meaning: 'Как вы выходите в социум и реализуете свой масштаб.',
      advice: 'С 40 до 60 лет эта энергия помогает выйти в социум и реализовать масштаб.',
    },
    spiritualPurpose: {
      label: 'Духовное предназначение',
      title: 'После 60',
      meaning: 'Внутренняя опора и смысл, которые остаются с вами на позднем этапе.',
      advice: 'После 60 лет это становится внутренней опорой и смыслом.',
    },
    planetaryPurpose: {
      label: 'Планетарное предназначение',
      title: 'Самый широкий уровень',
      meaning: 'Влияние на других людей и задачи, выходящие за пределы личной жизни.',
      advice: 'Через эту энергию вы влияете на других — используйте её осознанно.',
    },
    tl: {
      label: 'Род отца',
      title: 'Таланты рода',
      meaning: 'Сильная энергия, которую род передал по линии отца.',
      advice: 'Талант рода по отцу можно развивать и передавать дальше.',
    },
    tr: {
      label: 'Род матери',
      title: 'Таланты рода',
      meaning: 'Сильная энергия, которую род передал по линии матери.',
      advice: 'Талант рода по матери — это внутренняя и женская опора.',
    },
    br: {
      label: 'Род отца',
      title: 'Непроработанное',
      meaning: 'Программа рода, которую важно увидеть и завершить.',
      advice: 'Непроработанная программа рода отца: увидеть и завершить.',
    },
    bl: {
      label: 'Род матери',
      title: 'Непроработанное',
      meaning: 'Программа рода, которую важно увидеть и завершить.',
      advice: 'Непроработанная программа рода матери: увидеть и завершить.',
    },
    familyStrength: {
      label: 'Сила рода',
      title: 'Суммарный ресурс',
      meaning: 'Сумма четырёх родовых углов — общий ресурс семьи и её поддержка.',
      advice: 'Опирайтесь на силу рода, но не растворяйтесь в его сценариях.',
    },
    totalStrength: {
      label: 'Общая сила',
      title: 'Центр + род',
      meaning: 'Совокупность личного центра и силы рода.',
      advice: 'Это ваш общий резерв: личная опора плюс поддержка семьи.',
    },
    fatherLine: {
      label: 'Линия отца',
      title: 'Социальная реализация',
      meaning: 'Задачи и ресурсы, связанные с реализацией, деньгами и социальной ролью.',
      advice: 'Смотрите, какие сценарии отца помогают вам, а какие стоит завершить.',
    },
    motherLine: {
      label: 'Линия матери',
      title: 'Внутренняя опора',
      meaning: 'Задачи и ресурсы, связанные с отношениями, спокойствием и притяжением денег.',
      advice: 'Смотрите, какие сценарии матери поддерживают вас, а какие повторяются.',
    },
    sky: {
      label: 'Линия неба',
      title: 'Духовный канал',
      meaning: 'Связь с вдохновением, смыслом и тем, что важно осознать в этой жизни.',
      advice: 'Давайте себе пространство для смысла, а не только для результата.',
    },
    earth: {
      label: 'Линия земли',
      title: 'Материальный канал',
      meaning: 'Деньги, тело и быт — всё, что помогает заземлить идеи.',
      advice: 'Идеи становятся деньгами, когда вы доводите их до конкретных действий.',
    },
    karmaCenter: {
      label: 'Хвост · вход',
      title: 'С чего начинается урок',
      meaning: 'Первая энергия кармического хвоста: как запускается повторяющийся сценарий.',
      advice: 'Замечайте момент, когда этот сценарий включается.',
    },
    karmaMiddle: {
      label: 'Хвост · причина',
      title: 'Что его удерживает',
      meaning: 'Энергия, которая питает сценарий и мешает выйти из него.',
      advice: 'Ищите вторичную выгоду, из-за которой урок повторяется.',
    },
    karmaBottom: {
      label: 'Хвост · итог',
      title: 'К чему приводит',
      meaning: 'Нижний угол: итог непроработанного урока и одновременно точка силы.',
      advice: 'Признайте урок — и эта энергия станет вашей опорой.',
    },
    anahataEarth: {
      label: 'Анахата · земля',
      title: 'Сердце и материя',
      meaning: 'Дополнительная точка на линии земли: как любовь связана с деньгами и телом.',
      advice: 'Проверьте, где в отношениях вы теряете себя ради материальной безопасности.',
    },
    anahataSky: {
      label: 'Анахата · небо',
      title: 'Сердце и дух',
      meaning: 'Дополнительная точка на линии неба: что помогает внутреннему балансу.',
      advice: 'Больше доверяйте интуиции в отношениях — она подскажет верный вектор.',
    },
  };

  function digitSum(value) {
    let number = Math.abs(Math.trunc(Number(value) || 0));
    let sum = 0;
    while (number > 0) {
      sum += number % 10;
      number = Math.floor(number / 10);
    }
    return sum;
  }

  /** Приводит число к диапазону 1–22 сложением цифр. 22 остаётся 22. */
  function reduce(value) {
    let number = Math.abs(Math.trunc(Number(value) || 0));
    while (number > 22) number = digitSum(number);
    return number === 0 ? 22 : number;
  }

  function parseIsoDate(iso) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
    if (!match) {
      throw new Error('Введите дату рождения в формате ДД.ММ.ГГГГ.');
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new Error('Такой даты не существует. Проверьте день и месяц.');
    }

    const today = new Date();
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    if (date.getTime() > todayUtc) {
      throw new Error('Дата рождения не может быть в будущем.');
    }
    if (year < 1900) {
      throw new Error('Поддерживаются даты начиная с 1900 года.');
    }

    return { year, month, day };
  }

  function formatDate(day, month, year) {
    return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
  }

  function makePoint(key, value) {
    return {
      key,
      value,
      arcana: BY_NUMBER.get(value) || ARCANA[0],
      position: POSITIONS[key],
    };
  }

  function calculate(iso, rawName = '') {
    const { year, month, day } = parseIsoDate(iso);

    const A = reduce(day);
    const B = month;
    const C = reduce(year);
    const D = reduce(A + B + C);
    const center = reduce(A + B + C + D);

    const inner = (corner) => {
      const nearCenter = reduce(corner + center);
      return {
        nearCenter,
        nearCorner: reduce(corner + nearCenter),
      };
    };

    const a = inner(A);
    const b = inner(B);
    const c = inner(C);
    const d = inner(D);

    const tl = reduce(A + B);
    const tr = reduce(B + C);
    const br = reduce(C + D);
    const bl = reduce(D + A);

    const familyStrength = reduce(tl + tr + br + bl);
    const totalStrength = reduce(center + familyStrength);
    const sky = reduce(B + D);
    const earth = reduce(A + C);
    const fatherLine = reduce(tl + br);
    const motherLine = reduce(tr + bl);
    const personalPurpose = reduce(sky + earth);
    const socialPurpose = reduce(fatherLine + motherLine);
    const spiritualPurpose = reduce(personalPurpose + socialPurpose);
    const planetaryPurpose = reduce(socialPurpose + spiritualPurpose);

    const moneyEntry = reduce(C + center);
    const relationshipEntry = reduce(D + center);
    const balance = reduce(moneyEntry + relationshipEntry);
    const moneyPoint = reduce(moneyEntry + balance);
    const relationshipPoint = reduce(relationshipEntry + balance);

    const values = {
      A,
      B,
      C,
      D,
      center,
      tl,
      tr,
      br,
      bl,
      familyStrength,
      totalStrength,
      fatherLine,
      motherLine,
      sky,
      earth,
      personalPurpose,
      socialPurpose,
      spiritualPurpose,
      planetaryPurpose,
      moneyEntry,
      balance,
      moneyPoint,
      relationshipEntry,
      relationshipPoint,
      karmaCenter: d.nearCenter,
      karmaMiddle: d.nearCorner,
      karmaBottom: D,
      anahataEarth: reduce(a.nearCenter + center),
      anahataSky: reduce(b.nearCenter + center),
      innerA1: a.nearCenter,
      innerA2: a.nearCorner,
      innerB1: b.nearCenter,
      innerB2: b.nearCorner,
      innerC1: c.nearCenter,
      innerC2: c.nearCorner,
      innerD1: d.nearCenter,
      innerD2: d.nearCorner,
    };

    const points = {};
    Object.keys(POSITIONS).forEach((key) => {
      if (values[key] !== undefined) points[key] = makePoint(key, values[key]);
    });

    const ageScale = [
      [0, 'A'],
      [10, 'tl'],
      [20, 'B'],
      [30, 'tr'],
      [40, 'C'],
      [50, 'br'],
      [60, 'D'],
      [70, 'bl'],
    ].map(([age, key]) => ({
      age,
      key,
      value: values[key],
      arcana: BY_NUMBER.get(values[key]) || ARCANA[0],
    }));

    const name = String(rawName || '')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .trim()
      .slice(0, 40);

    return {
      iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      formattedDate: formatDate(day, month, year),
      name,
      values,
      points,
      ageScale,
      sections: {
        personal: ['A', 'B', 'C', 'D', 'center'],
        money: ['moneyEntry', 'balance', 'moneyPoint', 'relationshipEntry', 'relationshipPoint'],
        purpose: ['personalPurpose', 'socialPurpose', 'spiritualPurpose', 'planetaryPurpose'],
        ancestral: ['tl', 'tr', 'br', 'bl'],
        karma: ['karmaCenter', 'karmaMiddle', 'karmaBottom'],
      },
      allPoints: Object.keys(POSITIONS).filter((key) => values[key] !== undefined),
    };
  }

  window.MatrixDestiny = {
    ARCANA,
    POSITIONS,
    calculate,
    reduce,
    formatDate,
  };
})();
