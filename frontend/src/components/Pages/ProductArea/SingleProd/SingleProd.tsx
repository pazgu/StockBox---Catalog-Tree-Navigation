import React, { FC, useState } from "react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../ui/accordion"
import cam from "../../../../assets/red-lens-camera.png"
import { Heart, PencilLine, Upload } from "lucide-react"


interface SingleProdProps {}

const SingleProd: FC<SingleProdProps> = () => {
  const [role] = useState<string | null>(() => localStorage.getItem("role"))
  const [isEditing, setIsEditing] = useState(false)

  const [title, setTitle] = useState("מצלמת DSLR קלאסית עם עדשה אדומה")
  const [description, setDescription] = useState(
    "פתרון מקצועי לצילום איכותי עם עיצוב רטרו ועמידות גבוהה."
  )
  const [productDescription, setProductDescription] = useState(
    "מצלמת DSLR מקצועית עם עדשה איכותית ועיצוב קלאסי רטרו. המצלמה מציעה איכות תמונה מעולה עם חיישן מתקדם ובקרה מלאה על כל הגדרות הצילום."
  )
  const [specifications, setSpecifications] = useState(
    "רזולוציה 24MP, חיישן APS-C, עדשה 18-55mm, מסך LCD 3 אינץ', חיבור Wi-Fi"
  )
  const [features, setFeatures] = useState([
    "איכות תמונה חדה במיוחד",
    "עיצוב רטרו יוקרתי עם טבעות אדומות",
    "צילום ווידאו 4K מקצועי",
    "עדשה מהירה לצילום בתאורה חלשה",
    "נוחות אחיזה ובקרה"
  ])
  const [productImage, setProductImage] = useState(cam)
  const [originalImage] = useState(cam) // Store original image for reset
  const [hasImageChanged, setHasImageChanged] = useState(false) // Track if image was changed

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const addFeature = () => {
    setFeatures([...features, "תכונה חדשה"])
  }

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index)
    setFeatures(newFeatures)
  }

  const resetImage = () => {
    setProductImage(originalImage)
    setHasImageChanged(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result
          if (result && typeof result === 'string') {
            setProductImage(result)
            setHasImageChanged(true) // Mark that image has been changed
          }
        }
        reader.onerror = () => {
          console.error('Error reading file')
          alert('שגיאה בקריאת הקובץ')
        }
        reader.readAsDataURL(file)
      } else {
        alert('אנא בחר קובץ תמונה תקין')
      }
    }
    // Reset the input value so the same file can be selected again
    event.target.value = ''
  }

  return (
    <div className="pt-40 px-6 pb-10 font-['Noto_Sans_Hebrew']" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* כותרת ראשית עם כפתור עריכה */}
        <div className="text-right mb-4 flex items-center justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent text-stockblue text-4xl font-bold border-b-2 border-stockblue outline-none w-full text-right"
              />
            ) : (
              <h1 className="text-4xl font-bold text-stockblue bg-gradient-to-r from-stockblue to-stockblue bg-clip-text text-transparent">
                {title}
              </h1>
            )}
          </div>
         
          {/* כפתור עריכה מיושר עם הכותרת */}
          <button
            className="bg-stockblue hover:bg-stockblue/90 text-white
                       px-5 py-2.5 rounded-full font-semibold shadow-lg
                       hover:shadow-xl ring-2 ring-stockblue/30 hover:ring-stockblue/40
                       transition-all duration-300 flex items-center gap-2 mr-4"
            onClick={() => setIsEditing(!isEditing)}
            aria-label={isEditing ? 'סיום עריכה' : 'עריכת דף'}
          >
            <PencilLine size={18} />
            {isEditing ? 'סיום עריכה' : 'עריכת דף'}
          </button>
        </div>

        {/* תיאור משני */}
        <div className="text-right mb-12">
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-transparent text-gray-700 text-lg border-b border-gray-400 outline-none w-full max-w-2xl text-right resize-none"
            />
          ) : (
            <p className="text-lg text-gray-700 max-w-2xl">{description}</p>
          )}
        </div>

        {/* תוכן הדף */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* אזור התמונה והכפתור */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="group relative bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-stockblue/5 to-stockblue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stockblue to-stockblue"></div>

              {/* Image Area */}
              <div className="relative bg-gray-50 rounded-xl p-6 mb-4 overflow-hidden group/image">
                <img
                  src={productImage}
                  alt="מצלמת DSLR קלאסית עם עדשה אדומה"
                  className="w-full h-40 object-contain relative z-10 transition-all duration-300 group-hover:scale-105 drop-shadow-md"
                />
               
                {/* Image upload overlay when editing - Always visible when editing */}
                {isEditing && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-xl flex items-end justify-center pb-3 transition-all duration-300 z-20">
                    <div className="flex gap-2">
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer bg-white/95 backdrop-blur-sm text-stockblue px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white border border-white/30 text-sm"
                      >
                        <Upload size={14} />
                        <span>החלף</span>
                      </label>
                     
                      {/* Reset button - only show if image has been changed */}
                      {hasImageChanged && (
                        <button
                          onClick={resetImage}
                          className="bg-gray-700/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-800 border border-gray-600/30 text-sm"
                        >
                          <span className="text-xs">↶</span>
                          <span>ביטול</span>
                        </button>
                      )}
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
               
                {/* Edit indicator when not hovering */}
                {isEditing && (
                  <div className="absolute top-2 right-2 bg-stockblue/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    עריכה
                  </div>
                )}
              </div>

              {/* Buttons */}
              {role === "user" ? (
                <div className="space-y-2 relative z-10">
                  <button className="w-full bg-stockblue hover:bg-stockblue/90 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md">
                    פנייה לחבר צוות
                  </button>

                  <button className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
                    <Heart size={16} />
                    <span>הוסף למועדפים</span>
                  </button>
                </div>
              ) : role === "admin" ? (
                <div className="relative z-10">
                  <a
                    href="/permissions"
                    className="block w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md text-center"
                  >
                    נהל הרשאות
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          {/* אזור המידע — accordion blends with page */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-transparent rounded-2xl p-0 border-0 shadow-none">
              <Accordion type="single" collapsible className="w-full space-y-2">
                <AccordionItem value="description" className="border-b border-gray-200/70">
                  <AccordionTrigger className="text-stockblue text-lg font-semibold py-4 hover:no-underline text-right w-full [&>svg]:text-stockblue rounded-lg hover:bg-stockblue/5 px-2 -mx-2 transition-colors">
                    תיאור המוצר
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 text-base leading-relaxed pb-6 text-right">
                    {isEditing ? (
                      <textarea
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className="w-full bg-white/50 border border-gray-300 rounded-lg p-4 text-gray-700 resize-none focus:ring-2 focus:ring-stockblue/50 focus:border-stockblue transition-all duration-300"
                        rows={4}
                        placeholder="תיאור המוצר..."
                      />
                    ) : (
                      productDescription
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="specifications" className="border-b border-gray-200/70">
                  <AccordionTrigger className="text-stockblue text-lg font-semibold py-4 hover:no-underline text-right w-full [&>svg]:text-stockblue rounded-lg hover:bg-stockblue/5 px-2 -mx-2 transition-colors">
                    מפרט טכני
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 text-base leading-relaxed pb-6">
                    {isEditing ? (
                      <textarea
                        value={specifications}
                        onChange={(e) => setSpecifications(e.target.value)}
                        className="w-full bg-white/50 border border-gray-300 rounded-lg p-4 text-gray-700 resize-none focus:ring-2 focus:ring-stockblue/50 focus:border-stockblue transition-all duration-300"
                        rows={3}
                        placeholder="מפרט טכני..."
                      />
                    ) : (
                      specifications
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="features" className="border-b border-gray-200/70">
                  <AccordionTrigger className="text-stockblue text-lg font-semibold py-4 hover:no-underline text-right w-full [&>svg]:text-stockblue rounded-lg hover:bg-stockblue/5 px-2 -mx-2 transition-colors">
                    מאפיינים עיקריים
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    {isEditing ? (
                      <div className="space-y-3">
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <button
                              onClick={() => removeFeature(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors duration-200 text-sm"
                              title="הסר תכונה"
                            >
                              ✕
                            </button>
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => handleFeatureChange(index, e.target.value)}
                              className="flex-1 bg-white/50 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm focus:ring-2 focus:ring-stockblue/50 focus:border-stockblue transition-all duration-300"
                              placeholder="תכונה..."
                            />
                          </div>
                        ))}
                        <button
                          onClick={addFeature}
                          className="bg-stockblue/10 hover:bg-stockblue/20 text-stockblue px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-stockblue/30 hover:border-stockblue/50"
                        >
                          + הוסף תכונה
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {features.map((feature, index) => (
                          <div key={index} className="text-gray-700 text-sm text-right">
                            • {feature}
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleProd