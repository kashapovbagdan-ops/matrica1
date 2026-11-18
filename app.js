(() => {
  'use strict';

  const MD = window.MatrixDestiny;
  if (!MD) {
    console.error('MatrixDestiny is not loaded');
    return;
  }

  const { ARCANA, POSITIONS, calculate } = MD;
  const $ = (selector, root = document) => root.querySelector(selector);
  const STORAGE_KEY = 'matrica:last-calculation';
  const CHART_TIP_ID = 'chartPointTip';
  const WHEEL_STEP = 360 / 22;

  let current = null;
  let wheelRotation = 0;
  let wheelBusy = false;
  let wheelTimer = null;

  const els = {
    form: $('#matrixForm'),
    name: $('#nameInput'),
    date: $('#birthDate'),
    error: $('#formError'),
    sample: $('#sampleBtn'),
    result: $('#result'),
    resultTitle: $('#resultTitle'),
    resultSubtitle: $('#resultSubtitle'),
    chart: $('#matrixChart'),
    personalCards: $('#personalCards'),
    moneyCards: $('#moneyCards'),
    purposeCards: $('#purposeCards'),
    ancestralCards: $('#ancestralCards'),
    familyStrip: $('#familyStrip'),
    karmaCards: $('#karmaCards'),
    ageScale: $('#ageScale'),
    pointsTableBody: $('#pointsTableBody'),
    formulaGrid: $('#formulaGrid'),
    arcanaGrid: $('#arcanaGrid'),
    wheel: $('#fateWheel'),
    wheelDetail: $('#wheelDetail'),
    spinWheel: $('#spinWheelBtn'),
    copy: $('#copyBtn'),
    print: $('#printBtn'),
    toast: $('#toast'),
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------ utils
  function el(tag, className = '', text = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function arcanaByNumber(number) {
    return ARCANA[number - 1] || ARCANA[0];
  }

  const INNER_POINTS = {
    innerA1: {
      label: 'Линия дня',
      title: 'Внутренний ресурс',
      meaning: 'Промежуточная точка между днём рождения и центром: как личный код подпитывает вашу зону комфорта.',
      advice: 'Замечайте, что помогает вам возвращаться в ресурс, даже когда внешний фон меняется.',
      formula: 'день + центр',
    },
    innerA2: {
      label: 'Линия дня',
      title: 'Опора и урок',
      meaning: 'Следующая точка на линии дня: энергия, которая помогает удерживать ресурс и проходить личные уроки.',
      advice: 'Опирайтесь на эту энергию, когда нужно собраться и принять решение.',
      formula: 'день + внутренняя точка',
    },
    innerB1: {
      label: 'Линия месяца',
      title: 'Вдохновение',
      meaning: 'Как месяц рождения связан с центром: источник идей, поддержки и внутреннего движения.',
      advice: 'Проверяйте идеи на практике — эта энергия раскрывается через действие.',
      formula: 'месяц + центр',
    },
    innerB2: {
      label: 'Линия месяца',
      title: 'Поддержка',
      meaning: 'Дополнительная точка линии месяца: что помогает сохранять вдохновение и не терять контакт с собой.',
      advice: 'Давайте себе пространство для творчества и восстановления.',
      formula: 'месяц + внутренняя точка',
    },
    innerC1: {
      label: 'Линия года',
      title: 'Материальный урок',
      meaning: 'Как год рождения связан с центром: темы денег, зрелости и жизненного опыта.',
      advice: 'Смотрите на деньги как на результат зрелости и регулярных действий.',
      formula: 'год + центр',
    },
    innerC2: {
      label: 'Линия года',
      title: 'Деньги и зрелость',
      meaning: 'Следующая точка линии года: энергия, которая помогает закреплять результат и проходить уроки.',
      advice: 'Учитесь завершать начатое и не обесценивать уже пройденный путь.',
      formula: 'год + внутренняя точка',
    },
    innerD1: {
      label: 'Кармический хвост',
      title: 'Вход в урок',
      meaning: 'Первая дополнительная точка нижней линии: с чего начинается повторяющийся сценарий.',
      advice: 'Замечайте момент, когда старый сценарий включается.',
      formula: 'нижний угол + центр',
      cardKey: 'karmaCenter',
    },
    innerD2: {
      label: 'Кармический хвост',
      title: 'Причина урока',
      meaning: 'Вторая дополнительная точка нижней линии: что удерживает сценарий и мешает выйти из него.',
      advice: 'Ищите вторичную выгоду, из-за которой урок повторяется.',
      formula: 'нижний угол + внутренняя точка',
      cardKey: 'karmaMiddle',
    },
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function pointByKey(key) {
    if (!current) return null;
    if (current.points[key]) return current.points[key];
    const position = INNER_POINTS[key];
    const value = current.values[key];
    if (!position || value === undefined) return null;
    return {
      key,
      value,
      arcana: arcanaByNumber(value),
      position,
      cardKey: position.cardKey || null,
    };
  }

  const BRANCH_TONES = {
    A: 'violet',
    innerA1: 'violet',
    innerA2: 'violet',
    B: 'sky',
    innerB1: 'sky',
    innerB2: 'sky',
    C: 'gold',
    innerC1: 'gold',
    innerC2: 'gold',
    D: 'rose',
    innerD1: 'rose',
    innerD2: 'rose',
    center: 'gold',
    tl: 'mint',
    tr: 'mint',
    br: 'mint',
    bl: 'mint',
  };

  function pointAriaLabel(point) {
    return `${point.position.label}, ${point.position.title}, ${point.value}, ${point.arcana.name}`;
  }

  function todayIso() {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
  }

  function showError(message) {
    els.error.textContent = message;
    els.error.classList.add('show');
  }

  function clearError() {
    els.error.textContent = '';
    els.error.classList.remove('show');
  }

  function toast(message, type = 'ok') {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.className = `toast show ${type}`;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      els.toast.className = 'toast';
    }, 3400);
  }

  function scrollToResult(behavior) {
    if (!els.result || els.result.hidden) return;
    window.requestAnimationFrame(() => {
      const header = document.querySelector('.site-header');
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const top = Math.max(
        0,
        window.scrollY + els.result.getBoundingClientRect().top - headerHeight
      );
      window.scrollTo({
        top,
        behavior: behavior || (reducedMotion ? 'auto' : 'smooth'),
      });
    });
  }

  // ------------------------------------------------------------ подсказка
  function ensureChartTip() {
    let tip = document.getElementById(CHART_TIP_ID);
    if (!tip || tip.parentElement !== els.chart) {
      tip = el('div', 'chart-tip');
      tip.id = CHART_TIP_ID;
      tip.hidden = true;
      tip.setAttribute('role', 'dialog');
      tip.setAttribute('aria-modal', 'false');
      els.chart.append(tip);
    }
    return tip;
  }

  function clearChartLink() {
    const link = els.chart ? els.chart.querySelector('.chart-link') : null;
    if (link) link.remove();
  }

  function closePointTip() {
    const tip = document.getElementById(CHART_TIP_ID);
    if (!tip || tip.hidden) return;
    const active = els.chart.querySelector('[data-point].is-active');
    tip.hidden = true;
    clearChartLink();
    els.chart.querySelectorAll('[data-point]').forEach((node) => {
      node.classList.remove('is-active');
      node.setAttribute('aria-expanded', 'false');
    });
    if (active) active.focus({ preventScroll: true });
  }

  function drawChartLink(tip, pointX, pointY, side) {
    clearChartLink();
    const left = parseFloat(tip.style.left) || 0;
    const top = parseFloat(tip.style.top) || 0;
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    let edgeX;
    let edgeY;
    let middle;
    let d;

    if (side === 'right' || side === 'left') {
      edgeX = side === 'right' ? left : left + width;
      edgeY = clamp(pointY, top + 22, top + height - 22);
      middle = pointX + (edgeX - pointX) * 0.46;
      d = `M ${pointX} ${pointY} L ${middle} ${pointY} L ${edgeX} ${edgeY}`;
    } else {
      edgeX = clamp(pointX, left + 22, left + width - 22);
      edgeY = side === 'below' ? top : top + height;
      middle = pointY + (edgeY - pointY) * 0.46;
      d = `M ${pointX} ${pointY} L ${pointX} ${middle} L ${edgeX} ${edgeY}`;
    }

    const link = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    link.setAttribute('class', 'chart-link');
    link.setAttribute('aria-hidden', 'true');
    link.setAttribute('data-tone', tip.dataset.tone || 'gold');
    link.setAttribute('width', '100%');
    link.setAttribute('height', '100%');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'chart-link-path');
    path.setAttribute('pathLength', '1');
    path.setAttribute('d', d);

    const startDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    startDot.setAttribute('class', 'chart-link-dot');
    startDot.setAttribute('cx', String(pointX));
    startDot.setAttribute('cy', String(pointY));
    startDot.setAttribute('r', '3.8');

    const endDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    endDot.setAttribute('class', 'chart-link-end');
    endDot.setAttribute('cx', String(edgeX));
    endDot.setAttribute('cy', String(edgeY));
    endDot.setAttribute('r', '2.8');

    link.append(path, startDot, endDot);
    els.chart.insertBefore(link, tip);
  }

  function placePointTip(tip, node) {
    const chartRect = els.chart.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const pointX = nodeRect.left + nodeRect.width / 2 - chartRect.left;
    const pointY = nodeRect.top + nodeRect.height / 2 - chartRect.top;
    const width = chartRect.width;
    const height = chartRect.height;
    const tipWidth = tip.offsetWidth;
    const tipHeight = tip.offsetHeight;
    const margin = 8;
    const pointRadius = Math.max(nodeRect.width, nodeRect.height) / 2;
    const gap = Math.min(72, Math.max(32, pointRadius + 26));
    const maxTop = Math.max(margin, height - tipHeight - margin);
    let side = pointX < width / 2 ? 'right' : 'left';
    let left = side === 'right' ? pointX + gap : pointX - gap - tipWidth;
    let top = clamp(pointY - tipHeight / 2, margin, maxTop);
    let fits = left >= margin && left + tipWidth <= width - margin;

    if (!fits) {
      side = side === 'right' ? 'left' : 'right';
      left = side === 'right' ? pointX + gap : pointX - gap - tipWidth;
      fits = left >= margin && left + tipWidth <= width - margin;
    }

    if (!fits) {
      const belowTop = pointY + gap;
      const aboveTop = pointY - gap - tipHeight;
      if (belowTop + tipHeight <= height - margin) {
        side = 'below';
        top = belowTop;
      } else if (aboveTop >= margin) {
        side = 'above';
        top = aboveTop;
      } else {
        side = pointY < height / 2 ? 'below' : 'above';
        top = clamp(
          side === 'below' ? belowTop : aboveTop,
          margin,
          maxTop
        );
      }
      left = clamp(pointX - tipWidth / 2, margin, Math.max(margin, width - tipWidth - margin));
    }

    left = clamp(left, margin, Math.max(margin, width - tipWidth - margin));
    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
    drawChartLink(tip, pointX, pointY, side);
  }

  function openPointTip(key, node) {
    if (!els.chart) return;
    const point = pointByKey(key);
    if (!point) return;

    const tip = ensureChartTip();
    if (!tip.hidden && tip.dataset.forPoint === key) {
      closePointTip();
      return;
    }

    tip.dataset.forPoint = key;
    tip.dataset.tone = BRANCH_TONES[key] || 'gold';
    tip.innerHTML = '';
    tip.setAttribute(
      'aria-label',
      `${point.position.label}: ${point.arcana.name}, аркан ${point.value}. ${point.position.title}`
    );

    const head = el('div', 'chart-tip-head');
    const title = el('div', 'chart-tip-title');
    title.append(
      el('span', 'chart-tip-kicker', `${point.position.label} · аркан ${point.value}`),
      el('strong', '', point.arcana.name)
    );
    const close = el('button', 'chart-tip-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Закрыть ветку');
    close.addEventListener('click', closePointTip);
    head.append(title, close);

    const purpose = el('p', 'chart-tip-purpose', point.position.title);
    purpose.title = point.position.meaning;

    const actions = el('div', 'chart-tip-actions');
    const cardKey = point.cardKey || point.key;
    const card = document.getElementById(`point-${cardKey}`);
    const action = el('button', 'chart-tip-more');

    if (card) {
      action.textContent = 'Подробнее →';
      action.addEventListener('click', () => {
        closePointTip();
        card.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'center',
        });
        card.classList.add('is-flash');
        window.setTimeout(() => card.classList.remove('is-flash'), 1600);
      });
    } else {
      action.textContent = 'Аркан в справочнике →';
      action.addEventListener('click', () => {
        const details = document.getElementById(`arcana-${point.value}`);
        if (!details) return;
        closePointTip();
        details.open = true;
        details.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'center',
        });
      });
    }

    action.type = 'button';
    actions.append(action);
    tip.append(head, purpose, actions);

    els.chart.querySelectorAll('[data-point]').forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-expanded', 'false');
    });
    node.classList.add('is-active');
    node.setAttribute('aria-expanded', 'true');

    tip.hidden = false;
    tip.style.visibility = 'hidden';
    placePointTip(tip, node);
    tip.style.visibility = 'visible';
    close.focus({ preventScroll: true });
  }

  // --------------------------------------------------------------- storage
  function readStorage() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.date !== 'string') return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function saveStorage(result) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: result.iso, name: result.name, savedAt: new Date().toISOString() })
      );
    } catch (_) {
      /* приватный режим может запрещать localStorage */
    }
  }

  function updateUrl(result) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('date', result.iso);
      if (result.name) {
        url.searchParams.set('name', result.name);
      } else {
        url.searchParams.delete('name');
      }
      url.hash = '';
      window.history.replaceState(null, '', `${url.pathname}?${url.searchParams.toString()}`);
    } catch (_) {
      /* старые браузеры могут не поддерживать URL */
    }
  }

  // ------------------------------------------------------------------ поля
  function setDateLimits() {
    els.date.max = todayIso();
  }

  function fillFromSource(source) {
    if (!source || !source.date) return false;
    els.date.value = source.date;
    els.name.value = source.name || '';
    return true;
  }

  // ------------------------------------------------------------- визуал
  function polarity(label, text, className = '') {
    const p = el('p', className);
    p.append(el('strong', '', label), document.createTextNode(` ${text}`));
    return p;
  }

  function energyCard(point, tone) {
    const card = el('article', `energy-card tone-${tone}`);
    card.id = `point-${point.key}`;

    const top = el('div', 'energy-top');
    const label = el('span', 'energy-label', point.position.label);
    const number = el('span', 'energy-number', String(point.value));
    top.append(label, number);

    const title = el('h4', '', point.arcana.name);
    const position = el('p', 'energy-position', point.position.title);
    const meaning = el('p', 'energy-meaning', point.position.meaning);

    const tags = el('div', 'energy-tags');
    point.arcana.keywords.forEach((keyword) => tags.append(el('span', '', keyword)));

    const polarityBox = el('div', 'energy-polarity');
    polarityBox.append(
      polarity('В плюсе:', point.arcana.plus),
      polarity('В тени:', point.arcana.minus, 'shadow')
    );

    const advice = el('p', 'energy-advice');
    advice.append(el('strong', '', 'Совет: '), document.createTextNode(point.position.advice));

    card.append(top, title, position, meaning, tags, polarityBox, advice);
    return card;
  }

  function fillCards(container, keys, tone) {
    if (!container) return;
    container.innerHTML = '';
    container.classList.toggle('cards-grid--five', keys.length === 5);
    keys.forEach((key) => {
      const point = current.points[key];
      if (point) container.append(energyCard(point, tone));
    });
  }

  function familyStat(label, key) {
    const point = current.points[key];
    const box = el('div', 'family-stat');
    const name = point ? point.arcana.name : '—';
    box.append(
      el('span', '', label),
      el('strong', '', point ? `${point.value}` : '—'),
      el('small', '', name)
    );
    return box;
  }

  function renderFamilyStrip() {
    if (!els.familyStrip) return;
    els.familyStrip.innerHTML = '';
    [
      ['Сила рода', 'familyStrength'],
      ['Линия отца', 'fatherLine'],
      ['Линия матери', 'motherLine'],
      ['Линия неба', 'sky'],
      ['Линия земли', 'earth'],
    ].forEach(([label, key]) => els.familyStrip.append(familyStat(label, key)));
  }

  function renderAges(result) {
    if (!els.ageScale) return;
    els.ageScale.innerHTML = '';
    result.ageScale.forEach((item) => {
      const chip = el('article', 'age-chip');
      chip.append(
        el('span', '', `${item.age} лет`),
        el('strong', '', String(item.value)),
        el('small', '', item.arcana.name)
      );
      els.ageScale.append(chip);
    });
  }

  function renderTable(result) {
    if (!els.pointsTableBody) return;
    els.pointsTableBody.innerHTML = '';

    result.allPoints.forEach((key) => {
      const point = result.points[key];
      if (!point) return;
      const row = document.createElement('tr');
      const label = el('td', '', point.position.label);
      const value = el('td', '', String(point.value));
      const arcana = el('td', '', point.arcana.name);
      const meaning = el('td', '', point.position.title);
      row.append(label, value, arcana, meaning);
      els.pointsTableBody.append(row);
    });
  }

  function formulaRow(label, formula, value) {
    const row = el('div', 'formula-row');
    const name = el('span', '', label);
    const code = el('code', '', formula);
    const result = el('b', '', String(value));
    row.append(name, code, result);
    return row;
  }

  function renderFormula(result) {
    if (!els.formulaGrid) return;
    const [year, month, day] = result.iso.split('-').map(Number);
    const v = result.values;
    els.formulaGrid.innerHTML = '';
    [
      ['День', `reduce(${day})`, v.A],
      ['Месяц', `${month}`, v.B],
      ['Год', `reduce(${year})`, v.C],
      ['Нижний угол', `reduce(день + месяц + год)`, v.D],
      ['Центр', `reduce(день + месяц + год + низ)`, v.center],
      ['Родовые углы', 'reduce(день+месяц) · reduce(месяц+год) · reduce(год+низ) · reduce(низ+день)', `${v.tl} · ${v.tr} · ${v.br} · ${v.bl}`],
      ['Сила рода', `reduce(${v.tl}+${v.tr}+${v.br}+${v.bl})`, v.familyStrength],
      ['Небо / земля', 'reduce(месяц+низ) / reduce(день+год)', `${v.sky} / ${v.earth}`],
      ['Личное / социальное', 'reduce(небо+земля) / reduce(отец+мать)', `${v.personalPurpose} / ${v.socialPurpose}`],
      ['Духовное / планетарное', 'reduce(личное+социальное) / reduce(социальное+духовное)', `${v.spiritualPurpose} / ${v.planetaryPurpose}`],
      ['Деньги', 'reduce(год+центр) · баланс · денежная', `${v.moneyEntry} · ${v.balance} · ${v.moneyPoint}`],
      ['Отношения', 'reduce(низ+центр) · точка любви', `${v.relationshipEntry} · ${v.relationshipPoint}`],
      ['Кармический хвост', 'reduce(низ+центр) · ... · низ', `${v.karmaCenter} · ${v.karmaMiddle} · ${v.karmaBottom}`],
    ].forEach(([label, formula, value]) => els.formulaGrid.append(formulaRow(label, formula, value)));
  }

  function chartPoint(key, x, y, radius, value, tone) {
    const point = pointByKey(key);
    const label = point ? pointAriaLabel(point) : `${value}, ${arcanaByNumber(value).name}`;
    return `
      <g class="chart-point ${tone}" data-point="${key}" tabindex="0" role="button"
         aria-expanded="false" aria-controls="${CHART_TIP_ID}" aria-label="${label}">
        <circle class="halo" cx="${x}" cy="${y}" r="${radius + 13}"></circle>
        <circle class="core" cx="${x}" cy="${y}" r="${radius}"></circle>
        <text class="number" x="${x}" y="${y}">${value}</text>
      </g>`;
  }

  function chartInner(key, x, y, value) {
    const point = pointByKey(key);
    const label = point ? pointAriaLabel(point) : `${value}, ${arcanaByNumber(value).name}`;
    return `
      <g class="chart-inner chart-inner--interactive" data-point="${key}" tabindex="0"
         role="button" aria-expanded="false" aria-controls="${CHART_TIP_ID}" aria-label="${label}">
        <circle class="inner-halo" cx="${x}" cy="${y}" r="25"></circle>
        <circle class="inner-core" cx="${x}" cy="${y}" r="17"></circle>
        <text x="${x}" y="${y}">${value}</text>
      </g>`;
  }

  function renderChart(result) {
    if (!els.chart) return;
    const v = result.values;

    els.chart.innerHTML = `
      <svg viewBox="0 0 800 800" role="group" aria-label="Схема матрицы судьбы: личный и родовой квадраты">
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stop-color="#2d2053"/>
            <stop offset="100%" stop-color="#171226"/>
          </radialGradient>
          <radialGradient id="chartHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(155,123,255,.22)"/>
            <stop offset="100%" stop-color="rgba(155,123,255,0)"/>
          </radialGradient>
        </defs>

        <circle cx="400" cy="400" r="330" fill="url(#chartHalo)" opacity=".5"></circle>
        <circle class="chart-orbit" cx="400" cy="400" r="330"></circle>
        <circle class="chart-orbit" cx="400" cy="400" r="256"></circle>
        <circle class="chart-orbit" cx="400" cy="400" r="165"></circle>

        <path class="chart-line personal" d="M140 400 L400 140 L660 400 L400 660 Z"></path>
        <path class="chart-line ancestral" d="M220 220 L580 220 L580 580 L220 580 Z"></path>
        <path class="chart-line ancestral" d="M220 220 L580 580"></path>
        <path class="chart-line ancestral" d="M580 220 L220 580"></path>
        <path class="chart-axis" d="M140 400 L660 400"></path>
        <path class="chart-axis" d="M400 140 L400 660"></path>

        ${chartInner('innerA1', 300, 400, v.innerA1)}
        ${chartInner('innerA2', 235, 400, v.innerA2)}
        ${chartInner('innerB1', 400, 300, v.innerB1)}
        ${chartInner('innerB2', 400, 235, v.innerB2)}
        ${chartInner('innerC1', 500, 400, v.innerC1)}
        ${chartInner('innerC2', 565, 400, v.innerC2)}
        ${chartInner('innerD1', 400, 500, v.innerD1)}
        ${chartInner('innerD2', 400, 565, v.innerD2)}

        ${chartPoint('center', 400, 400, 50, v.center, 'center')}
        ${chartPoint('A', 140, 400, 42, v.A, 'personal')}
        ${chartPoint('B', 400, 140, 42, v.B, 'personal')}
        ${chartPoint('C', 660, 400, 42, v.C, 'personal')}
        ${chartPoint('D', 400, 660, 42, v.D, 'personal')}

        ${chartPoint('tl', 220, 220, 34, v.tl, 'ancestral')}
        ${chartPoint('tr', 580, 220, 34, v.tr, 'ancestral')}
        ${chartPoint('br', 580, 580, 34, v.br, 'ancestral')}
        ${chartPoint('bl', 220, 580, 34, v.bl, 'ancestral')}

        <text class="chart-age" x="55" y="404">0 лет</text>
        <text class="chart-age" x="145" y="193">10</text>
        <text class="chart-age" x="400" y="66">20</text>
        <text class="chart-age" x="655" y="193">30</text>
        <text class="chart-age" x="746" y="404">40</text>
        <text class="chart-age" x="655" y="617">50</text>
        <text class="chart-age" x="400" y="744">60</text>
        <text class="chart-age" x="145" y="617">70</text>
      </svg>`;

    els.chart.querySelectorAll('[data-point]').forEach((node) => {
      const open = () => openPointTip(node.dataset.point, node);
      node.addEventListener('click', open);
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      });
    });
  }

  // ------------------------------------------------------------- колесо
  function wheelPolar(radius, angle) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: 300 + radius * Math.cos(rad),
      y: 300 + radius * Math.sin(rad),
    };
  }

  function wheelSegmentPath(index) {
    const start = -90 + index * WHEEL_STEP;
    const end = start + WHEEL_STEP;
    const outerStart = wheelPolar(274, start);
    const outerEnd = wheelPolar(274, end);
    const innerEnd = wheelPolar(148, end);
    const innerStart = wheelPolar(148, start);
    return [
      `M ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
      `A 274 274 0 0 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
      `L ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
      `A 148 148 0 0 0 ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
      'Z',
    ].join(' ');
  }

  function wheelArcanaUsage(number) {
    if (!current) return [];
    return [...new Set(
      Object.values(current.points)
        .filter((point) => point.value === number)
        .map((point) => point.position.label)
    )];
  }

  function showWheelDetail(arcana, point = null, spun = false) {
    if (!els.wheelDetail) return;
    const labels = wheelArcanaUsage(arcana.number);
    els.wheelDetail.innerHTML = '';

    const top = el('div', 'wheel-detail-top');
    top.append(
      el('span', 'wheel-detail-number', String(arcana.number)),
      (() => {
        const title = el('div', 'wheel-detail-title');
        title.append(
          el('strong', '', arcana.name),
          el('small', '', point
            ? `${point.position.label} · ${point.position.title}`
            : spun
              ? 'Выпавшая энергия'
              : 'Аркан колеса')
        );
        return title;
      })()
    );

    const tags = el('div', 'wheel-tags');
    arcana.keywords.forEach((keyword) => tags.append(el('span', '', keyword)));

    const plus = el('p', 'wheel-polarity wheel-plus');
    plus.append(el('strong', '', 'В плюсе: '), document.createTextNode(arcana.plus));
    const minus = el('p', 'wheel-polarity wheel-minus');
    minus.append(el('strong', '', 'В тени: '), document.createTextNode(arcana.minus));

    const usage = el('p', 'wheel-usage');
    if (labels.length) {
      usage.append(
        el('strong', '', 'В вашей матрице: '),
        document.createTextNode(labels.join(' · '))
      );
    } else {
      usage.textContent = 'Этой энергии нет среди основных точек — дополнительный ресурс.';
    }

    els.wheelDetail.append(top, tags, plus, minus, usage);

    els.wheel.querySelectorAll('.wheel-segment').forEach((node) => {
      node.classList.toggle(
        'is-selected',
        Number(node.dataset.arcana) === arcana.number
      );
    });
  }

  function renderWheel(result) {
    if (!els.wheel) return;
    if (wheelTimer) {
      window.clearTimeout(wheelTimer);
      wheelTimer = null;
    }
    wheelBusy = false;
    wheelRotation = 0;

    const usage = new Map();
    Object.values(result.points).forEach((point) => {
      usage.set(point.value, (usage.get(point.value) || 0) + 1);
    });

    const segments = ARCANA.map((arcana, index) => {
      const start = -90 + index * WHEEL_STEP;
      const middle = start + WHEEL_STEP / 2;
      const label = wheelPolar(215, middle);
      const mark = wheelPolar(258, middle);
      const count = usage.get(arcana.number) || 0;
      const classes = [
        'wheel-segment',
        index % 2 ? 'odd' : 'even',
        count ? 'in-matrix' : '',
      ].filter(Boolean).join(' ');
      return `
        <g class="${classes}" data-arcana="${arcana.number}" tabindex="0" role="button"
           aria-label="Аркан ${arcana.number}, ${arcana.name}${count ? ', есть в вашей матрице' : ''}">
          <title>${arcana.number} · ${arcana.name}${count ? ' · есть в вашей матрице' : ''}</title>
          <path d="${wheelSegmentPath(index)}"></path>
          <text x="${label.x.toFixed(2)}" y="${label.y.toFixed(2)}">${String(arcana.number).padStart(2, '0')}</text>
          ${count ? `<circle class="wheel-mark" cx="${mark.x.toFixed(2)}" cy="${mark.y.toFixed(2)}" r="3"></circle>` : ''}
        </g>`;
    }).join('');

    els.wheel.innerHTML = `
      <svg viewBox="0 0 600 600" role="group" aria-label="Колесо из 22 арканов">
        <circle class="wheel-backdrop" cx="300" cy="300" r="288"></circle>
        <g class="wheel-rotor">
          ${segments}
        </g>
        <g class="wheel-center" aria-hidden="true">
          <circle cx="300" cy="300" r="138"></circle>
          <text class="wheel-center-number" x="300" y="287">22</text>
          <text class="wheel-center-caption" x="300" y="328">АРКАНА</text>
        </g>
      </svg>`;

    els.wheel.querySelectorAll('[data-arcana]').forEach((node) => {
      const select = () => {
        if (wheelBusy) return;
        showWheelDetail(arcanaByNumber(Number(node.dataset.arcana)));
      };
      node.addEventListener('click', select);
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    });

    if (els.spinWheel) {
      els.spinWheel.disabled = false;
      els.spinWheel.textContent = 'Крутить колесо';
    }

    showWheelDetail(ARCANA[0], null);
  }

  function spinWheel() {
    if (!els.wheel || !els.spinWheel || !current || wheelBusy) return;
    const index = Math.floor(Math.random() * ARCANA.length);
    const jitter = (Math.random() * 0.22 - 0.11) * WHEEL_STEP;
    const wanted = ((360 - ((index + 0.5) * WHEEL_STEP + jitter)) % 360 + 360) % 360;
    const currentMod = ((wheelRotation % 360) + 360) % 360;
    const delta = (wanted - currentMod + 360) % 360;

    wheelRotation += 360 * 4 + delta;
    wheelBusy = true;
    els.spinWheel.disabled = true;
    els.spinWheel.textContent = 'Колесо крутится…';

    const rotor = $('.wheel-rotor', els.wheel);
    if (rotor) {
      rotor.style.transition = reducedMotion ? 'none' : '';
      rotor.style.transform = `rotate(${wheelRotation}deg)`;
    }

    const done = () => {
      wheelBusy = false;
      els.spinWheel.disabled = false;
      els.spinWheel.textContent = 'Крутить ещё';
      showWheelDetail(ARCANA[index], null, true);
    };

    if (reducedMotion) {
      done();
    } else {
      wheelTimer = window.setTimeout(done, 3800);
    }
  }

  function renderSummary(result) {
    const a = result.points.A;
    const center = result.points.center;
    const money = result.points.moneyPoint;
    const love = result.points.relationshipPoint;
    const purpose = result.points.personalPurpose;

    if (a) {
      $('#summaryA').textContent = String(a.value);
      $('#summaryAName').textContent = a.arcana.name;
      $('#summaryAText').textContent = a.arcana.plus;
      $('#summaryATags').textContent = a.arcana.keywords.join(' · ');
    }
    if (center) {
      $('#summaryCenter').textContent = String(center.value);
      $('#summaryCenterName').textContent = center.arcana.name;
    }
    if (money) {
      $('#summaryMoney').textContent = String(money.value);
      $('#summaryMoneyName').textContent = money.arcana.name;
    }
    if (love) {
      $('#summaryLove').textContent = String(love.value);
      $('#summaryLoveName').textContent = love.arcana.name;
    }
    if (purpose) {
      $('#summaryPurpose').textContent = String(purpose.value);
      $('#summaryPurposeName').textContent = purpose.arcana.name;
    }
  }

  function renderResult(result, options = {}) {
    current = result;

    const title = result.name ? `Матрица · ${result.name}` : 'Матрица судьбы';
    els.resultTitle.textContent = title;
    els.resultSubtitle.textContent = `Дата рождения ${result.formattedDate} · 22 аркана · расчёт в браузере`;

    renderSummary(result);
    renderChart(result);
    renderWheel(result);
    fillCards(els.personalCards, result.sections.personal, 'personal');
    fillCards(els.moneyCards, result.sections.money, 'money');
    fillCards(els.purposeCards, result.sections.purpose, 'purpose');
    fillCards(els.ancestralCards, result.sections.ancestral, 'ancestral');
    fillCards(els.karmaCards, result.sections.karma, 'karma');
    renderFamilyStrip();
    renderAges(result);
    renderTable(result);
    renderFormula(result);

    els.result.hidden = false;

    if (options.scroll !== false) {
      scrollToResult();
    }
  }

  // --------------------------------------------------------------- арканы
  function renderArcana() {
    if (!els.arcanaGrid) return;
    els.arcanaGrid.innerHTML = '';

    ARCANA.forEach((arcana) => {
      const details = el('details', 'arcana-card');
      details.id = `arcana-${arcana.number}`;

      const summary = document.createElement('summary');
      const number = el('span', 'arcana-num', String(arcana.number).padStart(2, '0'));
      const title = el('span', 'arcana-title');
      title.append(
        el('strong', '', arcana.name),
        el('small', '', arcana.keywords.join(' · '))
      );
      const chevron = el('span', 'arcana-chevron', '+');
      summary.append(number, title, chevron);

      const body = el('div', 'arcana-body');
      body.append(
        polarity('В плюсе:', arcana.plus),
        polarity('В тени:', arcana.minus, 'minus')
      );

      details.append(summary, body);
      els.arcanaGrid.append(details);
    });
  }

  // ---------------------------------------------------------------- ссылка
  async function copyLink() {
    if (!current) {
      toast('Сначала рассчитайте матрицу', 'error');
      return;
    }

    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast('Ссылка на матрицу скопирована');
      return;
    } catch (_) {
      /* ниже резервный способ */
    }

    try {
      const area = document.createElement('textarea');
      area.value = url;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
      toast('Ссылка на матрицу скопирована');
    } catch (_) {
      toast('Не удалось скопировать ссылку', 'error');
    }
  }

  // ---------------------------------------------------------------- события
  function bindEvents() {
    els.form.addEventListener('submit', (event) => {
      event.preventDefault();
      clearError();

      if (!els.date.value) {
        showError('Выберите дату рождения — без неё матрицу не построить.');
        els.date.focus();
        return;
      }

      try {
        const result = calculate(els.date.value, els.name.value);
        saveStorage(result);
        updateUrl(result);
        renderResult(result);
        toast('Матрица рассчитана');
      } catch (error) {
        showError(error.message);
      }
    });

    els.name.addEventListener('input', clearError);
    els.date.addEventListener('input', clearError);

    els.sample.addEventListener('click', () => {
      els.date.value = '1992-06-23';
      els.name.value = '';
      els.form.requestSubmit();
    });

    els.copy.addEventListener('click', copyLink);
    els.print.addEventListener('click', () => {
      if (current) window.print();
    });

    if (els.spinWheel) {
      els.spinWheel.addEventListener('click', spinWheel);
    }

    document.addEventListener('click', (event) => {
      const tip = document.getElementById(CHART_TIP_ID);
      if (!tip || tip.hidden) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('.chart-tip') || target.closest('[data-point]')) return;
      closePointTip();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePointTip();
    });

    window.addEventListener('resize', closePointTip);
  }

  // ------------------------------------------------------------------ boot
  function boot() {
    setDateLimits();
    renderArcana();
    bindEvents();

    const params = new URLSearchParams(window.location.search);
    const urlDate = params.get('date');
    const urlName = params.get('name') || '';
    const stored = readStorage();

    if (urlDate) {
      fillFromSource({ date: urlDate, name: urlName });
      try {
        const result = calculate(urlDate, urlName);
        renderResult(result, { scroll: false });
        window.setTimeout(() => scrollToResult('auto'), 120);
      } catch (error) {
        showError(error.message);
      }
      return;
    }

    if (stored) {
      fillFromSource(stored);
      try {
        const result = calculate(stored.date, stored.name || '');
        renderResult(result, { scroll: false });
        updateUrl(result);
      } catch (_) {
        /* сохранённая дата могла устареть — просто оставим форму */
      }
    }
  }

  boot();
})();
