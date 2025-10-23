import YandexMap from "@/components/YandexMap";

import { withUtm } from "@/lib/utm";



export default function Index() {
  return (
    <div className="min-h-screen bg-[#282828] text-white font-sans">
      <div className="w-full">
        {/* Hero Section with Banner and Avatar */}
        <section className="relative bg-[#282828]">
          {/* Banner Background */}
          <div 
            className="w-full h-[400px] bg-cover bg-center"
            style={{
              backgroundImage: `url('https://static.tildacdn.pub/tild3064-3039-4734-b232-306632336332/noroot.png')`
            }}
          />
          
          {/* Avatar */}
          <div className="flex justify-center relative -mt-[80px] pb-[30px] z-10">
            <div 
              className="w-[140px] h-[140px] rounded-full bg-cover bg-center border-4 border-[#282828]"
              style={{
                backgroundImage: `url('https://static.tildacdn.pub/tild3163-6136-4132-b934-636430336539/noroot.png')`
              }}
            />
          </div>
        </section>

        {/* Divider with Star */}
        <div className="bg-[#282828] py-[15px] px-5 flex justify-center items-center gap-4">
          <div className="flex-1 max-w-[150px] h-px bg-gradient-to-r from-transparent to-[#693B9A]" />
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.5009 0L9.67541 4.6824L14.8006 5.30356L11.0194 8.81861L12.0124 13.8849L7.5009 11.375L2.98942 13.8849L3.98243 8.81861L0.201172 5.30356L5.32637 4.6824L7.5009 0ZM7.5009 2.22578L5.95696 5.55034L2.31802 5.99137L5.00275 8.48708L4.2977 12.0842L7.5009 10.3021L10.7041 12.0842L9.99904 8.48708L12.6838 5.99137L9.04484 5.55034L7.5009 2.22578Z" fill="#8D5193"/>
          </svg>
          <div className="flex-1 max-w-[150px] h-px bg-gradient-to-l from-transparent to-[#693B9A]" />
        </div>

        {/* Social Media Buttons */}
       {/* Social Media Buttons */}
<section className="bg-[#282828] py-[30px] px-5">
  <div className="max-w-[640px] mx-auto">
    <div className="flex flex-col gap-[10px] max-w-[350px] mx-auto">
      <a
        href={withUtm("https://vk.com/alice_makeup_nk", "vk_main")}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#693B9A] hover:bg-[#7a4aab] transition-colors rounded-md py-[14px] px-4 text-center font-bold text-[13px]"
      >
        Мои работы
      </a>

      <a
        href={withUtm("https://wa.me/79179198890", "wa_booking")}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#693B9A] hover:bg-[#7a4aab] transition-colors rounded-md py-[14px] px-4 text-center"
      >
        <div className="font-bold text-[13px]">WhatsApp</div>
        <div className="text-[11px] opacity-80 font-bold">Запись</div>
      </a>

      <a
        href={withUtm("https://vk.me/alice_makeup_nk1", "vk_dm")}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#693B9A] hover:bg-[#7a4aab] transition-colors rounded-md py-[14px] px-4 text-center"
      >
        <div className="font-bold text-[13px]">VKontakte</div>
        <div className="text-[11px] opacity-80 font-bold">Запись</div>
      </a>

      <a
        href={withUtm("https://t.me/alice_makeup_nk", "tg_booking")}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#693B9A] hover:bg-[#7a4aab] transition-colors rounded-md py-[14px] px-4 text-center"
      >
        <div className="font-bold text-[13px]">Telegram</div>
        <div className="text-[11px] opacity-80 font-bold">Запись</div>
      </a>

      <a
        href={withUtm("https://www.instagram.com/alice_makeup_nk", "ig_profile")}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#693B9A] hover:bg-[#7a4aab] transition-colors rounded-md py-[14px] px-4 text-center"
      >
        <div className="font-bold text-[13px]">Instagram</div>
        <div className="text-[11px] opacity-80 font-bold">Запись</div>
      </a>
    </div>
  </div>
</section>


        {/* Divider with Star */}
        <div className="bg-[#282828] py-[15px] px-5 flex justify-center items-center gap-4">
          <div className="flex-1 max-w-[150px] h-px bg-gradient-to-r from-transparent to-[#693B9A]" />
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.5009 0L9.67541 4.6824L14.8006 5.30356L11.0194 8.81861L12.0124 13.8849L7.5009 11.375L2.98942 13.8849L3.98243 8.81861L0.201172 5.30356L5.32637 4.6824L7.5009 0ZM7.5009 2.22578L5.95696 5.55034L2.31802 5.99137L5.00275 8.48708L4.2977 12.0842L7.5009 10.3021L10.7041 12.0842L9.99904 8.48708L12.6838 5.99137L9.04484 5.55034L7.5009 2.22578Z" fill="#8D5193"/>
          </svg>
          <div className="flex-1 max-w-[150px] h-px bg-gradient-to-l from-transparent to-[#693B9A]" />
        </div>

        {/* Price List Section */}
        <section className="bg-[#282828] py-[30px] px-5">
          <div className="max-w-[640px] mx-auto">
            {/* Section Title */}
            <h2 className="text-center text-[28px] font-bold uppercase mb-[45px]">Прайс лист</h2>

            {/* Service Card 1 - Day Makeup (Image Left, Text Right) */}
            <div className="flex flex-col md:flex-row gap-6 mb-[75px]">
              {/* Mobile Image */}
              <div 
                className="md:hidden w-full aspect-[4/3] rounded-lg bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://static.tildacdn.pub/tild3837-6139-4637-b862-363861663836/photo.jpg')`
                }}
              />
              
              {/* Desktop Image - Left */}
              <div className="hidden md:block md:w-1/2 flex-shrink-0">
                <div 
                  className="w-full aspect-[4/3] rounded-lg bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://static.tildacdn.pub/tild3837-6139-4637-b862-363861663836/photo.jpg')`
                  }}
                />
              </div>

              {/* Text Content - Right */}
              <div className="md:w-1/2 flex flex-col justify-center">
                <h3 className="text-[21px] font-bold uppercase mb-4">Дневной макияж</h3>
                <p className="text-[12px] font-light leading-[20.3px] mb-6">
                  Сияющий тон, коррекция, легкий макияж глаз, оформление бровей, нюдовые губы, включает в себя накладные ресницы.
                </p>
                <button className="bg-[#693B9A] hover:bg-[#7a4aab] transition-colors rounded-lg py-[12px] px-4 text-center font-bold text-[12px] w-full md:w-auto">
                  1 700 ₽
                </button>
              </div>
            </div>

            {/* Service Card 2 - Evening Makeup (Text Left, Image Right on Desktop) */}
            <div className="flex flex-col md:flex-row-reverse gap-6 mb-[75px]">
              {/* Mobile Image */}
              <div 
                className="md:hidden w-full aspect-[4/3] rounded-lg bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://static.tildacdn.pub/tild3939-3534-4131-b238-643031336133/photo.jpg')`
                }}
              />
              
              {/* Desktop Image - Right */}
              <div className="hidden md:block md:w-1/2 flex-shrink-0">
                <div 
                  className="w-full aspect-[4/3] rounded-lg bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://static.tildacdn.pub/tild3939-3534-4131-b238-643031336133/photo.jpg')`
                  }}
                />
              </div>

              {/* Text Content - Left */}
              <div className="md:w-1/2 flex flex-col justify-center">
                <h3 className="text-[20px] font-bold uppercase mb-4">Вечерний макияж</h3>
                <p className="text-[12px] font-light leading-[20.3px] mb-6">
                  Сияющий тон, коррекция, эффектный взгляд (от смоки до стрелок), оформление бровей, подходящее оформление губ, включает в себя накладные ресницы.
                </p>
                <button className="bg-[#693B9A] hover:bg-[#7a4aab] transition-colors rounded-lg py-[12px] px-4 text-center font-bold text-[12px] w-full md:w-auto">
                  2 000 ₽
                </button>
              </div>
            </div>

            {/* Service Card 3 - Wedding Makeup (Image Left, Text Right) */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Mobile Image */}
              <div 
                className="md:hidden w-full aspect-[4/3] rounded-lg bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://static.tildacdn.pub/tild6432-6437-4631-b963-383339396131/photo.jpg')`
                }}
              />
              
              {/* Desktop Image - Left */}
              <div className="hidden md:block md:w-1/2 flex-shrink-0">
                <div 
                  className="w-full aspect-[4/3] rounded-lg bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://static.tildacdn.pub/tild6432-6437-4631-b963-383339396131/photo.jpg')`
                  }}
                />
              </div>

              {/* Text Content - Right */}
              <div className="md:w-1/2 flex flex-col justify-center">
                <h3 className="text-[20px] font-bold uppercase mb-4">Свадебный макияж</h3>
                <p className="text-[12px] font-light leading-[20.3px] mb-6">
                  Сияющий тон, коррекция, эффектный взгляд (от смоки до стрелок), оформление бровей, подходящее оформление губ, включает в себя накладные ресницы, оформление тела + предоставляются расходники (мини косметичка).
                </p>
                <button className="bg-[#693B9A] hover:bg-[#7a4aab] transition-colors rounded-lg py-[12px] px-4 text-center font-bold text-[12px] w-full md:w-auto">
                  2 500 ₽
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Divider with Star */}
        <div className="bg-[#282828] py-[15px] px-5 flex justify-center items-center gap-4">
          <div className="flex-1 max-w-[150px] h-px bg-gradient-to-r from-transparent to-[#693B9A]" />
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.5009 0L9.67541 4.6824L14.8006 5.30356L11.0194 8.81861L12.0124 13.8849L7.5009 11.375L2.98942 13.8849L3.98243 8.81861L0.201172 5.30356L5.32637 4.6824L7.5009 0ZM7.5009 2.22578L5.95696 5.55034L2.31802 5.99137L5.00275 8.48708L4.2977 12.0842L7.5009 10.3021L10.7041 12.0842L9.99904 8.48708L12.6838 5.99137L9.04484 5.55034L7.5009 2.22578Z" fill="#8D5193"/>
          </svg>
          <div className="flex-1 max-w-[150px] h-px bg-gradient-to-l from-transparent to-[#693B9A]" />
        </div>

        {/* Address Section */}
        <section className="bg-[#282828] py-[15px] px-5">
          <div className="max-w-[640px] mx-auto text-center">
            <p className="text-[14px] font-light leading-[23.2px]">
              <span className="font-bold">Адрес:</span><br/>
              г. Нижнекамск, ул. Бызова 2к2, салон Dream Room
            </p>
          </div>
        </section>

        {/* Map Section (Yandex) */}
<YandexMap
  key="55.657748,51.824357"
  center={[55.657748, 51.824357]}
  zoom={17}
  height={385}
/>

        {/* Footer */}
        <footer className="bg-[#0D0D0D] py-[45px] pb-[60px] px-5">
          <div className="max-w-[640px] mx-auto text-center">
            <p className="text-[10px] font-light leading-[17.4px] text-[#C6C6C6]">
              All text, photo, and video materials belong to their owners and are for demonstration purposes only. Please do not use them in commercial projects.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
