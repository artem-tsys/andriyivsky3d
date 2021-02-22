<?php
// не должно быть пробелов перед первым тегом!!!
    echo json_encode('<div class="s3d-card js-s3d-card">
      <div class="s3d-card__top">
        <div class="s3d-card__type">
        <span data-key="type"></span>
        </div>
        <div class="s3d-card__close js-s3d-card__close"></div>
        <label data-id="" data-key="id" class="s3d-card__add-favourites js-s3d-add__favourites">
           <input type="checkbox" data-key="checked" />
           <svg><use xlink:href="#icon-favourites"></use></svg>
        </label>
        <div class="s3d-card__image"><img src="" data-key="src"></div>
      </div>
      <div class="s3d-card__middle"></div>
      <div class="s3d-card__bottom">
          <table class="s3d-card__table">
             <tbody>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">№ квартиры</td>
                  <td class="s3d-card__value" data-key="number"></td>
                </tr>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">Этаж</td>
                  <td class="s3d-card__value" data-key="floor"></td>
                </tr>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">Комнаты</td>
                  <td class="s3d-card__value" data-key="rooms"></td>
                </tr>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">Площадь м2</td>
                  <td class="s3d-card__value" data-key="area"</td>
                </tr>
             </tbody>
          </table>
          <div class="s3d-card__buttons">
             <button type="button" data-key="id" class="s3d-card__link js-s3d-card__link">Детальніше
               <svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                 viewBox="0 0 400 6" preserveAspectRatio="xMaxYMid slice" xml:space="preserve">
                <polygon points="400,2.8 397.6,0.3 397.6,2.3 0,2.3 0,3.3 397.6,3.3 397.6,5.3 "/>
              </svg>
             </button>
          </div>
      </div>
   </div>')
?>
