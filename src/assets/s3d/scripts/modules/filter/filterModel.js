import ionRangeSlider from 'ion-rangeslider';
import $ from 'jquery';
import _ from 'lodash';
import EventEmitter from '../eventEmitter/EventEmitter';
import {
  addBlur, debounce,
} from '../general/General';

class FilterModel extends EventEmitter {
  constructor(config) {
    super();
    this.filter = {};
    this.configProject = {};
    this.subject = config.subject;
    this.updateCurrentFilterFlatsId = config.updateCurrentFilterFlatsId;
    this.currentFilterFlatsId$ = config.currentFilterFlatsId$;
    this.getFlat = config.getFlat;
    this.updateFsm = config.updateFsm;
  }

  init() {
    this.configProject = this.getMinMaxParam(this.getFlat());
    Object.entries(this.configProject).forEach(coll => {
      const [key, value] = coll;
      switch (this.getTypeFilterParam(key)) {
          case 'checkbox':
            this.setCheckbox(key);
            break;
          case 'range':
            for (const name in value) {
              value[name] = (name === 'min') ? Math.floor(value[name]) : Math.ceil(value[name]);
            }
            value['type'] = key;
            this.createRange(value);
            this.setRange(key);
            break;
          default:
            break;
      }
    });
    this.emit('setAmountAllFlat', _.size(this.getFlat()));
    this.filterFlatStart();
    this.deb = debounce(this.resize.bind(this), 500);
  }

  // запускает фильтр квартир
  filterFlatStart() {
    addBlur('.js-s3d-filter__table');
    addBlur('.s3d-pl__right');
    const filterSettings = this.getFilterParam(this.filter);
    this.updateAllParamFilter(filterSettings);
    const flats = this.startFilter(this.getFlat(), filterSettings);
    this.emit('setAmountSelectFlat', flats.length);
    this.updateCurrentFilterFlatsId(flats);

    this.emit('showSelectElements', flats);
  }

  // нужно переписать #change
  getMinMaxParam(flats) {
    const data = Object.keys(flats);
    const configProject = data.reduce((acc, key) => {
      const el = flats[key];
      const keysFilter = ['area', 'floor', 'rooms'];
      const config = keysFilter.reduce((accKeys, name) => {
        if (!_.has(el, name)) {
          return accKeys;
        }
        const setting = accKeys;
        if (!setting[name]) {
          setting[name] = { min: el[name], max: el[name] };
          return setting;
        }
        if (el[name] < setting[name].min) {
          setting[name].min = el[name];
        }
        if (el[name] > setting[name].max) {
          setting[name].max = el[name];
        }
        return setting;
      }, acc);

      return config;
    }, {});
    return configProject;
  }

  // создает range slider (ползунки), подписывает на события
  createRange(config) {
    if (config.type !== undefined) {
      const self = this;
      const { min, max } = config;
      const $min = $(`.js-s3d-filter__${config.type}__min--input`);
      const $max = $(`.js-s3d-filter__${config.type}__max--input`);
      $(`.js-s3d-filter__${config.type}--input`).ionRangeSlider({
        type: 'double',
        grid: false,
        min,
        max,
        from: min || 0,
        to: max || 0,
        step: config.step || 1,
        onStart: updateInputs,
        onChange: updateInputs,
        onFinish(e) {
          updateInputs(e);
          self.filterFlatStart();
        },
        onUpdate: updateInputs,
      });
      const instance = $(`.js-s3d-filter__${config.type}--input`).data('ionRangeSlider');
      instance.update({
        min,
        max,
        from: min,
        to: max,
      });

      function updateInputs(data) {
        $min.prop('value', data.from);
        $max.prop('value', data.to);
      }

      $min.on('change', function () { changeInput.call(this, 'from'); });
      $max.on('change', function () { changeInput.call(this, 'to'); });

      function changeInput(key) {
        let val = $(this).prop('value');
        if (key === 'from') {
          if (val < min) val = min;
          else if (val > instance.result.to) val = instance.result.to;
        } else if (key === 'to') {
          if (val < instance.result.from) val = instance.result.from;
          else if (val > max) val = max;
        }

        instance.update(key === 'from' ? { from: val } : { to: val });
        $(this).prop('value', val);
        self.filterFlatStart();
      }
    }
  }

  // сбросить значения фильтра
  resetFilter() {
    this.emit('hideSelectElements');
    for (const key in this.filter) {
      if (this.filter[key].type === 'range') {
        this.filter[key].elem.update({ from: this.filter[key].elem.result.min, to: this.filter[key].elem.result.max });
      } else {
        this.filter[key].elem.each((i, el) => { el.checked ? el.checked = false : ''; });
      }
    }
    const flatsKeys = Object.keys(this.getFlat());
    this.updateCurrentFilterFlatsId(flatsKeys);
    this.emit('setAmountSelectFlat', flatsKeys.length);
  }

  updateAllParamFilter(filterSettings) {
    for (const key in filterSettings) {
      const select = filterSettings[key];
      if (this.getTypeFilterParam(key) === 'checkbox') {
        let { value } = _.cloneDeep(select);
        if (_.isArray(value) && value.length === 0) {
          for (let i = +this.configProject[key].min; i <= +this.configProject[key].max; i++) {
            value.push(i);
          }
        }
        value = value.join(', ');
        this.emit('updateMiniInfo', {
          type: key,
          value,
          key: 'amount',
        });
      } else if (this.getTypeFilterParam(key) === 'range') {
        this.emit('updateMiniInfo', {
          type: key,
          value: select.min,
          key: 'min',
        });

        this.emit('updateMiniInfo', {
          type: key,
          value: select.max,
          key: 'max',
        });
      }
    }
  }

  getTypeFilterParam(name) {
    const filterName = { range: ['area', 'floor'], checkbox: ['rooms'] };
    if (filterName.checkbox.includes(name)) {
      return 'checkbox';
    } else if (filterName.range.includes(name)) {
      return 'range';
    }
    return null;
  }

  // добавить range в список созданых фильтров
  setRange(type) {
    if (type !== undefined) {
      this.filter[type] = {};
      this.filter[type].type = 'range';
      this.filter[type].elem = $(`.js-s3d-filter__${type}--input`).data('ionRangeSlider');
    }
  }

  // добавить checkbox в список созданых фильтров
  setCheckbox(type) {
    if (type !== undefined) {
      if (!_.has(this.filter[type], 'elem')) {
        this.filter[type] = {
          elem: [],
          value: [],
          type: 'select',
        };
      }
      this.filter[type].elem = $(`.js-s3d-filter__${type} [data-type = ${type}]`);
    }
  }

  // поиск квартир по параметрам фильтра
  startFilter(flats, settings) {
    const flatsId = Object.keys(flats);
    return flatsId.filter(id => {
      const settingColl = Object.entries(settings);
      const isLeave = settingColl.every(setting => {
        const [name, value] = setting;
        if (_.has(flats, [id, name])) {
          if (this.getTypeFilterParam(name) === 'range') {
            return this.checkRangeParam(flats[id], name, value);
          } else if (this.getTypeFilterParam(name) === 'checkbox') {
            return this.checkSelectParam(flats[id], name, value);
          }
        }
        return false;
      });

      return isLeave;
    });
  }

  checkRangeParam(flat, key, value) {
    return (_.has(flat, key)
      && flat[key] >= value.min
      && flat[key] <= value.max);
  }

  checkSelectParam(flat, key, value) {
    return (_.includes(value.value, flat[key]) || _.size(value.value) === 0);
  }

  // добавить возможные варианты и/или границы (min, max) в список созданых фильтров
  getFilterParam(filter) {
    const settings = {};
    for (const key in filter) {
      settings[key] = {};
      switch (filter[key].type) {
          case 'select':
            settings[key]['value'] = [];
            filter[key].elem.each((i, el) => {
              if (el.checked) {
                settings[key].value.push($(el).data(key));
              }
            });
            break;
          case 'range':
            settings[key]['min'] = filter[key].elem.result.from;
            settings[key]['max'] = filter[key].elem.result.to;
            break;
          default:
            break;
      }
    }
    return settings;
  }

  resize() {
    this.emit('hideFilter');
  }
}

export default FilterModel;
