import{j as jsxRuntimeExports}from"./index-lko4Hfbd.js";import{r as reactExports}from"./vendor-WBEadHvS.js";const addCustomStyles=()=>{if(document.getElementById("places-autocomplete-styles"))return;const style=document.createElement("style");style.id="places-autocomplete-styles",style.textContent=`
    .pac-container {
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      font-family: inherit;
      margin-top: 4px;
      z-index: 9999 !important;
      overflow: hidden;
    }
    
    .pac-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .pac-item:last-child {
      border-bottom: none;
    }
    
    .pac-item:hover,
    .pac-item-selected {
      background-color: #f8fafc;
      border-left: 3px solid #3b82f6;
      padding-left: 13px;
    }
    
    .pac-item-query {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2px;
    }
    
    .pac-matched {
      font-weight: 700;
      color: #2563eb;
    }
    
    .pac-item-query .pac-matched {
      background-color: #dbeafe;
      padding: 1px 3px;
      border-radius: 3px;
    }
    
    .pac-icon {
      margin-right: 8px;
      opacity: 0.6;
    }
    
    /* Ensure no duplicate icons appear in the input field */
    .pac-target-input::before,
    .pac-target-input::after {
      display: none !important;
    }
    
    .pac-logo {
      padding: 8px 20px 8px 16px;
      border-top: 1px solid #f3f4f6;
      background-color: #f9fafb;
      font-size: 11px;
      color: #6b7280;
      text-align: right;
      margin-right: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
 
    
    .dark .pac-container {
      background-color: #1f2937;
      border-color: #374151;
    }
    
    .dark .pac-item {
      color: #f9fafb;
      border-bottom-color: #374151;
    }
    
    .dark .pac-item:hover,
    .dark .pac-item-selected {
      background-color: #374151;
    }
    
    .dark .pac-item-query {
      color: #f9fafb;
    }
    
    .dark .pac-matched {
      color: #60a5fa;
    }
    
    .dark .pac-item-query .pac-matched {
      background-color: #1e3a8a;
    }
    
    .dark .pac-logo {
      background-color: #111827;
      border-top-color: #374151;
      color: #9ca3af;
      padding: 8px 20px 8px 16px;
      margin-right: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,document.head.appendChild(style)},PlacesAutocomplete=({value,onChange,onPlaceSelect,placeholder="Enter destination...",className="",icon,disabled=!1,required=!1,name,id})=>{const[autocomplete,setAutocomplete]=reactExports.useState(null),[isLoaded,setIsLoaded]=reactExports.useState(!1),inputRef=reactExports.useRef(null);return reactExports.useEffect(()=>{addCustomStyles()},[]),reactExports.useEffect(()=>{let retryCount=0;const maxRetries=50,checkGoogleMaps=()=>{var _a,_b;(_b=(_a=window.google)==null?void 0:_a.maps)!=null&&_b.places?setIsLoaded(!0):retryCount<maxRetries?(retryCount++,setTimeout(checkGoogleMaps,100)):console.error("Google Maps Places API failed to load after multiple retries")};checkGoogleMaps()},[]),reactExports.useEffect(()=>{var _a,_b;if(!(!isLoaded||!inputRef.current||autocomplete||!((_b=(_a=window.google)==null?void 0:_a.maps)!=null&&_b.places)))try{const autocompleteInstance=new google.maps.places.Autocomplete(inputRef.current,{types:["(cities)"],componentRestrictions:{country:[]},fields:["place_id","formatted_address","name","geometry","address_components","types"]});autocompleteInstance.addListener("place_changed",()=>{const place=autocompleteInstance.getPlace();place.formatted_address&&(onChange(place.formatted_address),onPlaceSelect&&onPlaceSelect(place))}),setAutocomplete(autocompleteInstance)}catch(error){console.error("Error initializing Places Autocomplete:",error)}},[isLoaded,autocomplete,onChange,onPlaceSelect]),reactExports.useEffect(()=>()=>{autocomplete&&google.maps.event.clearInstanceListeners(autocomplete)},[autocomplete]),isLoaded?jsxRuntimeExports.jsxs("div",{className:"relative",children:[icon&&jsxRuntimeExports.jsx("div",{className:"absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400",children:icon}),jsxRuntimeExports.jsx("input",{ref:inputRef,type:"text",value,onChange:e=>onChange(e.target.value),placeholder,disabled:disabled||!isLoaded,required,name,id,className:`w-full py-3 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium hover:border-cyan-400 shadow-sm hover:shadow-md ${className}`})]}):jsxRuntimeExports.jsxs("div",{className:"relative",children:[icon&&jsxRuntimeExports.jsx("div",{className:"absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10",children:icon}),jsxRuntimeExports.jsx("input",{ref:inputRef,type:"text",value,onChange:e=>onChange(e.target.value),placeholder,disabled,required,name,id,className:`pac-target-input w-full py-3 ${icon?"pl-12 pr-4":"px-4"} border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium hover:border-cyan-400 shadow-sm hover:shadow-md ${className}`})]})};export{PlacesAutocomplete as P};
