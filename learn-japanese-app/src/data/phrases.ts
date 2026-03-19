export type PhraseKind = "Frase" | "Palabra";

export type PhraseCategory =
  | "Saludos y cortesía"
  | "Restaurantes"
  | "Compras"
  | "Direcciones"
  | "Transporte"
  | "Hotel y servicios"
  | "Emergencias"
  | "Conversación"
  | "Tiempo";

export interface PhraseItem {
  id: number;
  japanese: string;
  romaji: string;
  spanish: string;
  category: PhraseCategory;
  kind: PhraseKind;
}

export const PHRASES: PhraseItem[] = [
  { id: 1, japanese: "こんにちは", romaji: "Konnichiwa", spanish: "Hola", category: "Saludos y cortesía", kind: "Frase" },
  { id: 2, japanese: "おはようございます", romaji: "Ohayou gozaimasu", spanish: "Buenos días", category: "Saludos y cortesía", kind: "Frase" },
  { id: 3, japanese: "こんばんは", romaji: "Konbanwa", spanish: "Buenas noches (saludo)", category: "Saludos y cortesía", kind: "Frase" },
  { id: 4, japanese: "はじめまして", romaji: "Hajimemashite", spanish: "Encantado/a de conocerte", category: "Saludos y cortesía", kind: "Frase" },
  { id: 5, japanese: "よろしくお願いします", romaji: "Yoroshiku onegaishimasu", spanish: "Mucho gusto / cuento contigo", category: "Saludos y cortesía", kind: "Frase" },
  { id: 6, japanese: "ありがとうございます", romaji: "Arigatou gozaimasu", spanish: "Gracias", category: "Saludos y cortesía", kind: "Frase" },
  { id: 7, japanese: "どうもありがとうございます", romaji: "Doumo arigatou gozaimasu", spanish: "Muchísimas gracias", category: "Saludos y cortesía", kind: "Frase" },
  { id: 8, japanese: "すみません", romaji: "Sumimasen", spanish: "Disculpe / perdón", category: "Saludos y cortesía", kind: "Frase" },
  { id: 9, japanese: "ごめんなさい", romaji: "Gomen nasai", spanish: "Lo siento", category: "Saludos y cortesía", kind: "Frase" },
  { id: 10, japanese: "お願いします", romaji: "Onegaishimasu", spanish: "Por favor", category: "Saludos y cortesía", kind: "Frase" },
  { id: 11, japanese: "はい", romaji: "Hai", spanish: "Sí", category: "Conversación", kind: "Palabra" },
  { id: 12, japanese: "いいえ", romaji: "Iie", spanish: "No", category: "Conversación", kind: "Palabra" },
  { id: 13, japanese: "大丈夫です", romaji: "Daijoubu desu", spanish: "Estoy bien / no pasa nada", category: "Conversación", kind: "Frase" },
  { id: 14, japanese: "わかりました", romaji: "Wakarimashita", spanish: "Entendido", category: "Conversación", kind: "Frase" },
  { id: 15, japanese: "わかりません", romaji: "Wakarimasen", spanish: "No entiendo", category: "Conversación", kind: "Frase" },
  { id: 16, japanese: "日本語を勉強しています", romaji: "Nihongo o benkyou shiteimasu", spanish: "Estoy estudiando japonés", category: "Conversación", kind: "Frase" },
  { id: 17, japanese: "ゆっくり話してください", romaji: "Yukkuri hanashite kudasai", spanish: "Habla más despacio, por favor", category: "Conversación", kind: "Frase" },
  { id: 18, japanese: "もう一度お願いします", romaji: "Mou ichido onegaishimasu", spanish: "Otra vez, por favor", category: "Conversación", kind: "Frase" },
  { id: 19, japanese: "英語は話せますか", romaji: "Eigo wa hanasemasu ka", spanish: "¿Hablas inglés?", category: "Conversación", kind: "Frase" },
  { id: 20, japanese: "スペイン語は話せますか", romaji: "Supeingo wa hanasemasu ka", spanish: "¿Hablas español?", category: "Conversación", kind: "Frase" },
  { id: 21, japanese: "トイレはどこですか", romaji: "Toire wa doko desu ka", spanish: "¿Dónde está el baño?", category: "Direcciones", kind: "Frase" },
  { id: 22, japanese: "駅はどこですか", romaji: "Eki wa doko desu ka", spanish: "¿Dónde está la estación?", category: "Direcciones", kind: "Frase" },
  { id: 23, japanese: "ここに行きたいです", romaji: "Koko ni ikitai desu", spanish: "Quiero ir aquí", category: "Direcciones", kind: "Frase" },
  { id: 24, japanese: "道に迷いました", romaji: "Michi ni mayoimashita", spanish: "Me he perdido", category: "Direcciones", kind: "Frase" },
  { id: 25, japanese: "地図を見せてください", romaji: "Chizu o misete kudasai", spanish: "Muéstrame el mapa, por favor", category: "Direcciones", kind: "Frase" },
  { id: 26, japanese: "近いですか", romaji: "Chikai desu ka", spanish: "¿Está cerca?", category: "Direcciones", kind: "Frase" },
  { id: 27, japanese: "遠いですか", romaji: "Tooi desu ka", spanish: "¿Está lejos?", category: "Direcciones", kind: "Frase" },
  { id: 28, japanese: "右です", romaji: "Migi desu", spanish: "A la derecha", category: "Direcciones", kind: "Frase" },
  { id: 29, japanese: "左です", romaji: "Hidari desu", spanish: "A la izquierda", category: "Direcciones", kind: "Frase" },
  { id: 30, japanese: "まっすぐ行ってください", romaji: "Massugu itte kudasai", spanish: "Sigue recto, por favor", category: "Direcciones", kind: "Frase" },
  { id: 31, japanese: "次の角を曲がってください", romaji: "Tsugi no kado o magatte kudasai", spanish: "Gira en la siguiente esquina", category: "Direcciones", kind: "Frase" },
  { id: 32, japanese: "いくらですか", romaji: "Ikura desu ka", spanish: "¿Cuánto cuesta?", category: "Compras", kind: "Frase" },
  { id: 33, japanese: "ちょっと高いですね", romaji: "Chotto takai desu ne", spanish: "Es un poco caro", category: "Compras", kind: "Frase" },
  { id: 34, japanese: "安くできますか", romaji: "Yasuku dekimasu ka", spanish: "¿Se puede rebajar?", category: "Compras", kind: "Frase" },
  { id: 35, japanese: "カードは使えますか", romaji: "Kaado wa tsukaemasu ka", spanish: "¿Se puede pagar con tarjeta?", category: "Compras", kind: "Frase" },
  { id: 36, japanese: "現金だけですか", romaji: "Genkin dake desu ka", spanish: "¿Solo efectivo?", category: "Compras", kind: "Frase" },
  { id: 37, japanese: "レシートをください", romaji: "Reshiito o kudasai", spanish: "Recibo, por favor", category: "Compras", kind: "Frase" },
  { id: 38, japanese: "これをください", romaji: "Kore o kudasai", spanish: "Esto, por favor", category: "Compras", kind: "Frase" },
  { id: 39, japanese: "試着してもいいですか", romaji: "Shichaku shitemo ii desu ka", spanish: "¿Puedo probármelo?", category: "Compras", kind: "Frase" },
  { id: 40, japanese: "他のサイズはありますか", romaji: "Hoka no saizu wa arimasu ka", spanish: "¿Hay otra talla?", category: "Compras", kind: "Frase" },
  { id: 41, japanese: "おすすめは何ですか", romaji: "Osusume wa nan desu ka", spanish: "¿Qué recomiendas?", category: "Restaurantes", kind: "Frase" },
  { id: 42, japanese: "メニューをください", romaji: "Menyuu o kudasai", spanish: "Menú, por favor", category: "Restaurantes", kind: "Frase" },
  { id: 43, japanese: "水をください", romaji: "Mizu o kudasai", spanish: "Agua, por favor", category: "Restaurantes", kind: "Frase" },
  { id: 44, japanese: "お会計お願いします", romaji: "Okaikei onegaishimasu", spanish: "La cuenta, por favor", category: "Restaurantes", kind: "Frase" },
  { id: 45, japanese: "別々に払えますか", romaji: "Betsubetsu ni haraemasu ka", spanish: "¿Podemos pagar por separado?", category: "Restaurantes", kind: "Frase" },
  { id: 46, japanese: "辛くしないでください", romaji: "Karaku shinaide kudasai", spanish: "No lo hagas picante, por favor", category: "Restaurantes", kind: "Frase" },
  { id: 47, japanese: "アレルギーがあります", romaji: "Arerugii ga arimasu", spanish: "Tengo alergia", category: "Restaurantes", kind: "Frase" },
  { id: 48, japanese: "肉は食べません", romaji: "Niku wa tabemasen", spanish: "No como carne", category: "Restaurantes", kind: "Frase" },
  { id: 49, japanese: "ベジタリアンです", romaji: "Bejitarian desu", spanish: "Soy vegetariano/a", category: "Restaurantes", kind: "Frase" },
  { id: 50, japanese: "おいしいです", romaji: "Oishii desu", spanish: "Está rico", category: "Restaurantes", kind: "Frase" },
  { id: 51, japanese: "お腹がすきました", romaji: "Onaka ga sukimashita", spanish: "Tengo hambre", category: "Restaurantes", kind: "Frase" },
  { id: 52, japanese: "のどが渇きました", romaji: "Nodo ga kawakimashita", spanish: "Tengo sed", category: "Restaurantes", kind: "Frase" },
  { id: 53, japanese: "電車の切符を一枚ください", romaji: "Densha no kippu o ichimai kudasai", spanish: "Un billete de tren, por favor", category: "Transporte", kind: "Frase" },
  { id: 54, japanese: "ICカードはどこで買えますか", romaji: "Ai shii kaado wa doko de kaemasu ka", spanish: "¿Dónde puedo comprar una tarjeta IC?", category: "Transporte", kind: "Frase" },
  { id: 55, japanese: "この電車は新宿に行きますか", romaji: "Kono densha wa Shinjuku ni ikimasu ka", spanish: "¿Este tren va a Shinjuku?", category: "Transporte", kind: "Frase" },
  { id: 56, japanese: "何番線ですか", romaji: "Nanbansen desu ka", spanish: "¿Qué andén es?", category: "Transporte", kind: "Frase" },
  { id: 57, japanese: "遅れていますか", romaji: "Okureteimasu ka", spanish: "¿Va con retraso?", category: "Transporte", kind: "Frase" },
  { id: 58, japanese: "タクシーを呼んでください", romaji: "Takushii o yonde kudasai", spanish: "Llame un taxi, por favor", category: "Transporte", kind: "Frase" },
  { id: 59, japanese: "この住所までお願いします", romaji: "Kono juusho made onegaishimasu", spanish: "A esta dirección, por favor", category: "Transporte", kind: "Frase" },
  { id: 60, japanese: "空港までお願いします", romaji: "Kuukou made onegaishimasu", spanish: "Al aeropuerto, por favor", category: "Transporte", kind: "Frase" },
  { id: 61, japanese: "チェックインお願いします", romaji: "Chekkuin onegaishimasu", spanish: "Check-in, por favor", category: "Hotel y servicios", kind: "Frase" },
  { id: 62, japanese: "予約しています", romaji: "Yoyaku shiteimasu", spanish: "Tengo una reserva", category: "Hotel y servicios", kind: "Frase" },
  { id: 63, japanese: "一泊お願いします", romaji: "Ippaku onegaishimasu", spanish: "Una noche, por favor", category: "Hotel y servicios", kind: "Frase" },
  { id: 64, japanese: "Wi-Fiはありますか", romaji: "Wai-fai wa arimasu ka", spanish: "¿Hay Wi‑Fi?", category: "Hotel y servicios", kind: "Frase" },
  { id: 65, japanese: "パスワードは何ですか", romaji: "Pasuwaado wa nan desu ka", spanish: "¿Cuál es la contraseña?", category: "Hotel y servicios", kind: "Frase" },
  { id: 66, japanese: "鍵をなくしました", romaji: "Kagi o nakushimashita", spanish: "Perdí la llave", category: "Hotel y servicios", kind: "Frase" },
  { id: 67, japanese: "充電できますか", romaji: "Juuden dekimasu ka", spanish: "¿Puedo cargar el móvil aquí?", category: "Hotel y servicios", kind: "Frase" },
  { id: 68, japanese: "コンセントはありますか", romaji: "Konsento wa arimasu ka", spanish: "¿Hay enchufe?", category: "Hotel y servicios", kind: "Frase" },
  { id: 69, japanese: "助けてください", romaji: "Tasukete kudasai", spanish: "Ayúdeme, por favor", category: "Emergencias", kind: "Frase" },
  { id: 70, japanese: "警察を呼んでください", romaji: "Keisatsu o yonde kudasai", spanish: "Llame a la policía", category: "Emergencias", kind: "Frase" },
  { id: 71, japanese: "病院はどこですか", romaji: "Byouin wa doko desu ka", spanish: "¿Dónde está el hospital?", category: "Emergencias", kind: "Frase" },
  { id: 72, japanese: "気分が悪いです", romaji: "Kibun ga warui desu", spanish: "Me siento mal", category: "Emergencias", kind: "Frase" },
  { id: 73, japanese: "薬局はどこですか", romaji: "Yakkyoku wa doko desu ka", spanish: "¿Dónde está la farmacia?", category: "Emergencias", kind: "Frase" },
  { id: 74, japanese: "熱があります", romaji: "Netsu ga arimasu", spanish: "Tengo fiebre", category: "Emergencias", kind: "Frase" },
  { id: 75, japanese: "写真を撮ってもいいですか", romaji: "Shashin o tottemo ii desu ka", spanish: "¿Puedo hacer una foto?", category: "Conversación", kind: "Frase" },
  { id: 76, japanese: "撮ってくれますか", romaji: "Totte kuremasu ka", spanish: "¿Me puedes sacar una foto?", category: "Conversación", kind: "Frase" },
  { id: 77, japanese: "今、何時ですか", romaji: "Ima nanji desu ka", spanish: "¿Qué hora es ahora?", category: "Tiempo", kind: "Frase" },
  { id: 78, japanese: "今日は何曜日ですか", romaji: "Kyou wa nan-youbi desu ka", spanish: "¿Qué día es hoy?", category: "Tiempo", kind: "Frase" },
  { id: 79, japanese: "今日", romaji: "Kyou", spanish: "Hoy", category: "Tiempo", kind: "Palabra" },
  { id: 80, japanese: "明日", romaji: "Ashita", spanish: "Mañana", category: "Tiempo", kind: "Palabra" },
  { id: 81, japanese: "昨日", romaji: "Kinou", spanish: "Ayer", category: "Tiempo", kind: "Palabra" },
  { id: 82, japanese: "今", romaji: "Ima", spanish: "Ahora", category: "Tiempo", kind: "Palabra" },
  { id: 83, japanese: "後で", romaji: "Ato de", spanish: "Luego", category: "Tiempo", kind: "Palabra" },
  { id: 84, japanese: "すぐに", romaji: "Sugu ni", spanish: "Enseguida", category: "Tiempo", kind: "Palabra" },
  { id: 85, japanese: "ここ", romaji: "Koko", spanish: "Aquí", category: "Direcciones", kind: "Palabra" },
  { id: 86, japanese: "そこ", romaji: "Soko", spanish: "Ahí", category: "Direcciones", kind: "Palabra" },
  { id: 87, japanese: "あそこ", romaji: "Asoko", spanish: "Allí", category: "Direcciones", kind: "Palabra" },
  { id: 88, japanese: "これ", romaji: "Kore", spanish: "Esto", category: "Conversación", kind: "Palabra" },
  { id: 89, japanese: "それ", romaji: "Sore", spanish: "Eso", category: "Conversación", kind: "Palabra" },
  { id: 90, japanese: "あれ", romaji: "Are", spanish: "Aquello", category: "Conversación", kind: "Palabra" },
  { id: 91, japanese: "人", romaji: "Hito", spanish: "Persona", category: "Conversación", kind: "Palabra" },
  { id: 92, japanese: "友達", romaji: "Tomodachi", spanish: "Amigo/a", category: "Conversación", kind: "Palabra" },
  { id: 93, japanese: "家族", romaji: "Kazoku", spanish: "Familia", category: "Conversación", kind: "Palabra" },
  { id: 94, japanese: "仕事", romaji: "Shigoto", spanish: "Trabajo", category: "Conversación", kind: "Palabra" },
  { id: 95, japanese: "休み", romaji: "Yasumi", spanish: "Descanso / día libre", category: "Conversación", kind: "Palabra" },
  { id: 96, japanese: "電話", romaji: "Denwa", spanish: "Teléfono", category: "Hotel y servicios", kind: "Palabra" },
  { id: 97, japanese: "充電器", romaji: "Juudenki", spanish: "Cargador", category: "Hotel y servicios", kind: "Palabra" },
  { id: 98, japanese: "入口", romaji: "Iriguchi", spanish: "Entrada", category: "Direcciones", kind: "Palabra" },
  { id: 99, japanese: "出口", romaji: "Deguchi", spanish: "Salida", category: "Direcciones", kind: "Palabra" },
  { id: 100, japanese: "危ない", romaji: "Abunai", spanish: "Peligroso / cuidado", category: "Emergencias", kind: "Palabra" },
];

export const CATEGORIES = ["Todo", ...new Set(PHRASES.map((phrase) => phrase.category))] as const;
