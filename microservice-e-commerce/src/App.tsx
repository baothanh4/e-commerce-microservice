import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { ProductList } from './components/ProductList';
import { ProductDetail } from './components/ProductDetail';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ProfilePage } from './components/ProfilePage';
import type { Product, CartItem } from './types';
import { Sparkles, ArrowRight } from 'lucide-react';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Ghế Thư Giãn Lusso",
    price: 8500000,
    rating: 4.9,
    badge: "Bán chạy",
    category: "Nội thất",
    subCategory: "Phòng Khách",
    brand: "LussoDesign",
    material: "Vải nhung cao cấp, Khung kim loại",
    description: "Ghế thư giãn Lusso mang lại nét sang trọng cho mọi không gian với đệm nhung êm ái và thiết kế đường cong chuẩn mực nâng đỡ cột sống hoàn hảo.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfrh-5pYCAMpA5f8DnQAwem-l6MArBTGKY60DG1oS4YuhyIjU0gbS-l-YuBZeleopO_N7v8fB1-KlRACBabgE_Alt8bfuLZcu4HVNpE0_DndSgc-lm1ZNYvY_O4LHecnFxr_W1fFquxlLzpGuNWW29fLKdTbEME9G9G2uXt7qr_2T-sGsoM8N8Dg8CDRdCFiYpeQOvPRQJc_aTyAWR3EWL0642V2mjbk5-sVouzkesg6ihuQVhVMzcsO7_pApEeX6nB2AAsDOBiQ",
    sizes: ["Compact", "Standard", "Deluxe"],
    colors: [
      { name: "Navy Velvet", value: "#1E3A8A" },
      { name: "Classic Gray", value: "#6B7280" },
      { name: "Forest Green", value: "#14532D" }
    ],
    specs: [
      { label: "Kích thước", value: "85 x 90 x 95 cm" },
      { label: "Chất liệu khung", value: "Thép mạ carbon chống rỉ" },
      { label: "Nệm mút", value: "Memory foam bọc nhung cao cấp" },
      { label: "Bảo hành", value: "12 tháng tại nhà" }
    ],
    highlights: [
      { label: "Thiết kế chuẩn công thái học", value: "" },
      { label: "Đệm nhung chống xẹp lún", value: "" },
      { label: "Góc ngả lưng thư giãn 135 độ", value: "" }
    ].map(h => h.label)
  },
  {
    id: 2,
    name: "Đèn Đứng Nova Brass",
    price: 3200000,
    rating: 4.8,
    badge: "",
    category: "Đồ trang trí",
    subCategory: "Đồ Trang Trí",
    brand: "ClassicHome",
    material: "Đồng thau nguyên khối",
    description: "Đèn Nova Brass toát lên vẻ cổ điển pha trộn hiện đại, kết cấu vững chãi từ đồng nguyên khối cùng bóng chụp thủy tinh khuếch tán ánh sáng ấm dịu nhẹ.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgju5KWp1okl1BuFV9zyXORLeCytWwb3gNtd4T4Hk6WxbEGdEvm9XYbcReHCUU-2Pyl3dHwbTPHLtzF93zZtU2SJEfuIw_C5Kjf0dD17mlAVRrYCgUm3UHxFY4kQSFuNROH88mVGI9zD7C-iBWjP1o4fEfXqAXl9xt57fZrzvg8PaVqiSw3t0utO6YN18SjVCoazlZDGkhE5mldk5GHkWpKQpZangc23Q1yO4OszrUcyRiKTejG-y_kEI8u1PQVZwM2-1c2Nf2hQ",
    sizes: ["1.5m Height", "1.8m Height"],
    colors: [
      { name: "Gold Brass", value: "#B45309" },
      { name: "Matte Black", value: "#1F2937" }
    ],
    specs: [
      { label: "Chiều cao", value: "165 cm" },
      { label: "Đế đèn", value: "Đá cẩm thạch nguyên khối" },
      { label: "Chuôi đèn", value: "E27 tiêu chuẩn châu Âu" },
      { label: "Bóng đèn đi kèm", value: "Led Edison 4W ấm áp" }
    ]
  },
  {
    id: 3,
    name: "Bàn Trà Gỗ Sồi Oaka",
    price: 5900000,
    rating: 5.0,
    badge: "Mới",
    category: "Nội thất",
    subCategory: "Bàn Ghế Ăn",
    brand: "OakaHome",
    material: "Gỗ sồi tự nhiên",
    description: "Bàn trà Oaka làm từ những khối gỗ sồi tuyển chọn kỹ lưỡng, vân gỗ tự nhiên sắc nét, thiết kế tối giản mang lại sự thanh tao và ấm cúng.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTwnGbduEbK4lrBhGO4OsZDWK5VtI1ikZA-6M9hxleOcq8fp_2e_MIFC_z9hzpr7S0ufa5RHFnqT3U_S2KodyECRXTBH25zsRxaIAl-wD0qpwnK1CWa3W_fM5ncT3hSV_C1Hr_s6oJnS_dSR_62fmwA3w8drpAHqnLoTpVsRqGBwf4w2OeaX2l59nYyLYp0oRT-LoYYE2HXcnJbAXhiACXakYTf7s857GtPszO1Lqx8fGGgkM-3Nw3krg94SQ3V3krthKH1mTBKQ",
    sizes: ["Standard (60x60)", "Large (80x80)"],
    colors: [
      { name: "Oak Natural", value: "#F59E0B" },
      { name: "Oak Walnut", value: "#78350F" }
    ],
    specs: [
      { label: "Độ dày mặt bàn", value: "3.5 cm" },
      { label: "Kiểu chân", value: "Trụ gỗ tròn bo mịn" },
      { label: "Lớp phủ", value: "Vecni gốc nước chống trầy" }
    ]
  },
  {
    id: 4,
    name: "Bộ Đĩa Gốm Artisan",
    price: 1450000,
    rating: 4.7,
    badge: "",
    category: "Đồ trang trí",
    subCategory: "Đồ Trang Trí",
    brand: "LuxeBrand",
    material: "Gốm sứ thủ công (Set 4)",
    description: "Mỗi chiếc đĩa trong bộ sản phẩm Artisan đều là một tác phẩm độc nhất vô nhị được nung ở nhiệt độ cao, men mờ đốm nâu be nghệ thuật tinh tế.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgV36zu62rwYCesgzusAk4Oi-ts8cPKoFmMxw8N_dqeIYzNnBdDVBSkuqyr8Y2fTAhiFbjhaPCbvNodeKReRcc5j-d1A2Ea3pORlkzpOz5nil_OrXnwdeYv0ZcZ_3m2tcWhPQ7Bsqg7ZbmBcG7CBLnTyNj3N9UNmGEMx8Z5eYVay8QVZrR3y3xdnhNxk1pSGhrK-DQtSwfZMVs1Y9e9PtMdw3t_qkQk49AeximkXqQVaeH8SSETtV8_yZtABqrpJCyCC9JdyTjeg"
  },
  {
    id: 5,
    name: "Giường Bọc Nỉ Gray Lusso",
    price: 24500000,
    rating: 4.9,
    badge: "Bán chạy",
    category: "Nội thất",
    subCategory: "Phòng Ngủ",
    brand: "LussoDesign",
    material: "Khung gỗ dầu, bọc nỉ cao cấp",
    description: "Giường ngủ Lusso Gray sở hữu đường may rút cúc tinh tế ở đầu giường, đệm mút đàn hồi cao được bọc lớp nỉ xám thời thượng mang lại giấc ngủ êm ái.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqb6HaIhqYSFINioZgapMiKzDkwxsCinNl0TojZGkQwQbJkTIV9IhmdEEr9UeTw5iS6o8Ycqdnnhmj7kQRAfZgjHBBD9MwK_CV_5o8nM51u-wmDD7X4VDbEJUNqGrdzKoJXP_BEDCDjczYhp1CcN5dVpM3-yPl7dmWIryFGRXSmYwHbGrvlmZrVLRDLI4mvIe8hoJlRzirpUae10S4WsL5O-cF77Z8eLl6jFUrWJcf-Wl0eI0wgz7emZ9MbeytROLIz56uytpPvA",
    sizes: ["Standard (1.6m)", "King Size (1.8m)"],
    colors: [
      { name: "Gray Fabric", value: "#9CA3AF" },
      { name: "Cream White", value: "#F9FAF5" }
    ],
    specs: [
      { label: "Khung giường", value: "Gỗ dầu đỏ Nam Phi sấy khô" },
      { label: "Giát giường", value: "Thép hộp kết hợp nan gỗ cong" },
      { label: "Chân giường", value: "Gỗ sồi tiện tròn" }
    ]
  },
  {
    id: 6,
    name: "Bộ Bàn Ăn Gỗ Walnut",
    price: 18200000,
    rating: 4.8,
    badge: "Mới",
    category: "Nội thất",
    subCategory: "Bàn Ghế Ăn",
    brand: "OakaHome",
    material: "Gỗ óc chó tự nhiên",
    description: "Bộ bàn ăn Walnut kết hợp giữa bàn gỗ óc chó cao cấp và 4 ghế tựa êm ái. Mặt bàn phủ bóng chống nước và trầy xước, bền bỉ cùng năm tháng.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCL68nTTiEgfC0ocTEDEbvx17h00UWYfPI-5kwOAHVOgmlz2uZ85SpL8SDnNbCFIDlfvL1ZewrBL6xtok6NPLe3_Oj5GXH46zQeP5ZydJEqUK08vn2dEE2WxtUFIhsn_ccU8kgRiA7R03dH6vHnXyonieNSmDCDpjUUhaYJDuje8Y1hBFphvPLraamS2VDsRA0G-1gcS-qCuxFRvp_hn8Xy8vjr1kWBSgogJBai97vAVRz3vUMJi11AkVFnzSQhPPMYaFSU0j47Q",
    sizes: ["4 Ghế (1.4m)", "6 Ghế (1.8m)"],
    specs: [
      { label: "Chất liệu bàn", value: "Gỗ óc chó nhập khẩu Bắc Mỹ" },
      { label: "Nệm ghế", value: "Bọc vải lanh thoáng khí chống ẩm" }
    ]
  },
  {
    id: 7,
    name: "Bình Gốm Khắc Tay",
    price: 850000,
    rating: 4.6,
    badge: "",
    category: "Đồ trang trí",
    subCategory: "Đồ Trang Trí",
    brand: "LuxeBrand",
    material: "Gốm nung khắc chìm nghệ thuật",
    description: "Bình gốm trang trí được tạo tác bởi bàn tay nghệ nhân lành nghề, những đường khắc chìm ngẫu hứng mang đến vẻ mộc mạc và phong thái nghệ thuật sâu lắng.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgGOlqTjU7nwoZ9EHyefHCtxTF6fSoB1rb-u4igN5HptoQxydbDtSEPcmJ2jtkSO68CK4Stlc1_1RZ7LnyzjGqkNjxMVHKisWvEetDyTHcu7Ks_l9q2-48g-J60_IUMILjEG_-dxio8Iw4iklUfoAh49T0SlsOEWeOPHwMdyO9mcmzQamM_wA4o-foMDMSkAHe7YbndYTS8F37UX797SLyN_SMaHidk2LuH3P2G4WqpMf2rv-2K0rH1ktuOq_zDkW0ihrfhogcag"
  },
  {
    id: 8,
    name: "Sofa Da Bò Minimalist",
    price: 42000000,
    rating: 5.0,
    badge: "Bán chạy",
    category: "Nội thất",
    subCategory: "Phòng Khách",
    brand: "LussoDesign",
    material: "Da bò tiếp xúc, nệm lông vũ",
    description: "Chiếc sofa da bò cao cấp tối giản mang đến không gian phòng khách hiện đại và tinh tế bậc nhất. Đệm ngồi lót lông vũ êm sâu nâng niu từng phút giây sum vầy.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAc_NLLgeQi4KRnn31YHOuYJDD_D0pTWhujLu4e5fQtYwLiVznYLd2udhXb_FTCVU8Fm1tVI2bNLRy24LXM0ih-eF4EIfAvyTjOq_pM48wCG5iY7EUGtbGWWsA_cBSnx_sNNGeTHR2EG-fDTp1g6ZWtuH7-grqV0St2km6RUvMlNyH6hlXGrkK7ITiAzjKV2mO395CYOXDEM7jpMKSbdaN5JqS8Jp92MeGdHzErIUkBqw4kc0V8LXK9JnQc13mNHVgn82YMRgFgOA",
    sizes: ["Standard 2m2", "Large L-shape 3m"],
    colors: [
      { name: "Cognac Leather", value: "#7C2D12" },
      { name: "Amber Tan", value: "#D97706" }
    ],
    specs: [
      { label: "Chất liệu bọc", value: "Da bò thật 100% nhập khẩu Ý" },
      { label: "Lớp độn nâng đỡ", value: "Memory foam tỷ trọng cao bọc lông vũ" }
    ]
  },
  {
    id: 9,
    name: "Đồng Hồ Treo Tường Cao Cấp Chrono",
    price: 24500000,
    rating: 4.5,
    badge: "New Arrival",
    category: "Đồ trang trí",
    subCategory: "Đồ Trang Trí",
    brand: "UrbanWood",
    material: "Khung thép, Dây treo da bò",
    description: "Thiết kế treo tường độc đáo với dây treo bằng da bò tiếp xúc nguyên tấm kết hợp khung thép không gỉ mạ bạc và mặt số xanh navy sâu thẳm. Bộ kim thép Chronograph đem lại sự chính xác tuyệt đối và đẳng cấp cơ học cho ngôi nhà của bạn.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3-g9zp5TH17Lt-GQ6taVbn5Y-plDMtlbV7HIlHUl9X0q2alR_uyDPOW1Tm-E36tIvYeSkr6zNrEbffkWsj6_jb9wOquodkCW9Hcb6i58czXS4FlzZCLNZ95ry2m6LX1XlZSPkBf4J-imRTb9cLHjMk4JQOdN4H1tGXI1AF2scSmNeaYSsp17LAT8cI_I317q1KN_QGVm-L5HpskdlmnnGvn8j_puDUkxJ6uZGGFZ16s_At_kuq3-G1j5wm4vkcBHb-FNCzQLG4Q",
    gallery: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpOU9fWdeA4_fUntpw8M8YlHADNJ6Pf8s2rCS3LPbzlgCdyJmwwKvVmHLn_ZJL6KMBsQQ0SDs-3j6rPtzt5P9NMSd4tOGrNbdDV8dCf6qIKMI0Gh0-7jVsK-2AqnDGMzkkzWVkZ4fsy0g8tyEK0MaQJ5GIIB0aSX9NTnvrRXeQn2Ep9epeu92hCsdbRr42LuoywZrb2unt1fHnuK-2iL8CBFkqbQeAs5cIJpNhUpZec2JZeE4yvvhpFvb5efM1px71CFfk_e5ilw",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZTV_UVhUbLsqL2-C2kr6WXTcZm6lTArhUc_VsZnnuSMP95yFQh-IlUPQE_QtVl1uawmJcXVWcn57rbgxSji-JNTauQIJMDddSY9qPfTxEwB0QcPoEp9QydFVqUo6z-4kjJFPz7TPxWOq-w8r9QCheK8_je3vLYmRdIXRjtB3yvw3qKJORPtYsFslDNpv5qqstHOG9bMtHU5QLOdjdhsj5OsK5yI5Ic2Otumq3ETqT7TPpxoDxTHWXP_aUlK9dh8JkYV3ibX9e9g",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuChXqtJcY82Ny0V-hh7GtMVFfhE1x8TX_Iu_52zDHL_3eaPJc_T6ZosRRJZaJcukPn_LgmxKjDaMbBUKUImNfXaqVNf9l6GRHEEixSDGwOnqW6M08OTZ0BeSd4mEo_OTeJ1xEn0e3_MYWMaVuJ3W0pznG7HN2foAqZYucDJN9__Th8lDKQW-29E0mYowdZpKPVumXBxVQFPmZoYDkZ8viUgUteRlciU94RXTUOAISIAagLKHIYAbzww75VTXHuhvjWLoVmTKz4QWA"
    ],
    sizes: ["40cm Diameter", "42cm Diameter", "44cm Diameter"],
    colors: [
      { name: "Navy Dial", value: "#1A237E" },
      { name: "Classic Black", value: "#212121" },
      { name: "Cream White", value: "#EEEEEE" }
    ],
    specs: [
      { label: "Đường kính mặt", value: "42 cm" },
      { label: "Chất liệu dây treo", value: "Da bò thật tiếp xúc nguyên tấm" },
      { label: "Kính bảo vệ", value: "Mặt kính Sapphire chống lóa lồi nhẹ" },
      { label: "Bộ máy", value: "Japan Quartz thạch anh tĩnh âm tuyệt đối" },
      { label: "Chống nước", value: "Kháng bụi bẩn, chống ẩm 10 ATM" },
      { label: "Trọng lượng", value: "2.4 kg" }
    ],
    highlights: [
      "Bộ treo tường bằng da bò tiếp xúc đẳng cấp",
      "Bộ máy Quartz Nhật Bản không tiếng động",
      "Kính Sapphire chống xước hoàn hảo"
    ]
  },
  {
    id: 10,
    name: "Gối Tựa Sofa Premium Cotton",
    price: 1250000,
    rating: 4.8,
    badge: "New Arrival",
    category: "Đồ trang trí",
    subCategory: "Đồ Trang Trí",
    brand: "LuxeBrand",
    material: "Sợi Cotton tự nhiên dệt thô",
    description: "Gối tựa lưng Sofa làm từ sợi cotton tự nhiên cao cấp, ruột gối bông gòn êm ái chống xẹp lún. Vỏ gối dệt thô mộc mạc mang phong cách tối giản thời thượng.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIMqMv8w9BkZDZBpPQFAAJr4ppSvn8AZoLET3FBHbtrQUpBoePKxz2fJg9CeD4XROkEuW7q1hZQUMd6-z8tBSaQ15V5_mLDhbqUKvtMYMSfkY-OoT7mEmTF5PKZyib604cu6a5P1oPa01CPTlUhNIc2hisJDF8knLoIXbaZuSjVCd_J801kA6SZns3Hu410VJlDXaXrTEE9nRByYloULdP56qrdCUX751BVI0V3QaweclU79fp8V3mAl-6DEKQbq-ItjCTttZgzw",
    sizes: ["S (45x45)", "M (50x50)"]
  },
  {
    id: 11,
    name: "Thảm Trải Sàn Casual Navy Wool",
    price: 850000,
    originalPrice: 1050000,
    rating: 4.7,
    badge: "Sale 20%",
    category: "Đồ trang trí",
    subCategory: "Đồ Trang Trí",
    brand: "ClassicHome",
    material: "Sợi len lông cừu tự nhiên",
    description: "Thảm trải sàn dệt sợi cừu tổng hợp màu xanh navy sang trọng. Mặt thảm mềm mại, giữ ấm chân hiệu quả và chống trượt tối ưu.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4yekmB47LOlNFTYkXx38Ghwral259xS3-MWUh1Iea-JxzTHWzXR3bhG2kmvWkN9jGpg6_Xw82EeXq49dShUICse5WENt-I2lb3I75TzybVWEPCO7a6psiPEx5jfuK321LJ0ASdKPReC11o4cCofMnl5qSxmvN6DCVhn5spn8AZBl7GLAUnldb_49JSpBWbqrSL4bGJB8jDdog5qM50UTLwDeI05tiOrgpMAKsUeQvljBJ6ahMQRO_bO34B_ksGyPjVTbsScAzwQ",
    sizes: ["S (1.2x1.6m)", "M (1.6x2m)", "L (2x3m)"]
  },
  {
    id: 12,
    name: "Khăn Phủ Sofa Oxford Light Blue",
    price: 950000,
    rating: 4.6,
    badge: "Hot",
    category: "Đồ trang trí",
    subCategory: "Đồ Trang Trí",
    brand: "UrbanStyle",
    material: "Cotton Oxford dệt mịn",
    description: "Khăn phủ sofa trang trí phong cách Bắc Âu dệt hoa văn nhẹ nhàng. Chất liệu mềm mát, bảo vệ sofa tránh bụi bẩn và tạo điểm nhấn thanh lịch.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPWwgFmpCTXGZFodtJqgM5WXNo-EYMn7QRTZIpXUcNiuKV1LL_w7sBZoXNFDgRZnzF4yIgyfdfO9rQ8nIalyndCkPLtjsD2a208hiDp3w2GvcPuD6yzP3h3lASBDpFRNKesbNY2WRp7xsBH2cD7-G7ApSyJT0KCIcY_TVYlQYxYNeYIuv5e6rO2MSKlVVIBN2aILaOPfctl6a_cQO_HFNkvDHl_RLQRjVkLblGOz3V-0339tSdSF4Uq4bVfpWa-tXSnoLqMKF8mw",
    sizes: ["Standard 1.8m", "Large 2.2m"]
  },
  {
    id: 13,
    name: "Đệm Ngồi Ghế Ăn Linen Black",
    price: 780000,
    rating: 4.5,
    badge: "",
    category: "Nội thất",
    subCategory: "Bàn Ghế Ăn",
    brand: "ClassicHome",
    material: "Linen dệt thô mộc mạc",
    description: "Đệm lót ghế ăn chất liệu linen thô dệt dày dặn, đệm mút đàn hồi tốt đem lại cảm giác dễ chịu cho những bữa ăn sum vầy.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ2Tn0bREeZfPtP_i_Gcyg3FcRWcf8XDjW9CpIQ9DqZnrfVgrWFMQVhDaBNE52K5hftfYDVEQjNO6ciXPHeDcKXLLMtYmoclgi-lklVl_7y5CGgtF0PfeIvP3zTI6kRFgIKb9MIbCFCRAuMW9cpisz30Au4KfxGtdGMe5kuXBa2umFh7RemAtcKUaH9eYm8RtAZmEFrc_WQrm6odxh3r3ftUYL8Gtrj7zE4AVD1FNx2UG-_xyABRiMtTM1hPxOZhnJYNu8AL8iBw",
    sizes: ["S (40x40cm)", "M (45x45cm)"]
  }
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; token: string; role: string } | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLoginSuccess = (user: { name: string; email: string; token: string; role: string }) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setCurrentView('home');
  };

  // Navigation Routing States
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'detail' | 'login' | 'register' | 'profile'>('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('Phổ biến nhất');

  // Cart state persisted in localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist state persisted in localStorage
  const [favorites, setFavorites] = useState<number[]>(() => {
    const savedFavs = localStorage.getItem('favorites');
    return savedFavs ? JSON.parse(savedFavs) : [];
  });

  // Dark Mode state persisted in localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Sync dark mode class with state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Sync cart with localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync favorites with localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1, color?: string, size?: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && 
        item.selectedColor === color && 
        item.selectedSize === size
      );
      if (existingItem) {
        return prev.map(item => 
          item.product.id === product.id && 
          item.selectedColor === color && 
          item.selectedSize === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedColor: color, selectedSize: size }];
    });
    
    // Auto-open cart for immediate feedback
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Toggle favorite
  const handleToggleFavorite = (productId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Click handler to open FULL detail page view
  const handleProductDetailNavigate = (product: Product) => {
    setSelectedProductId(product.id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  // Navigation router
  const handleNavigate = (view: 'home' | 'products' | 'detail' | 'login' | 'register' | 'profile', sortByOption?: string) => {
    setCurrentView(view);
    if (sortByOption) {
      setSortBy(sortByOption);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category select routing
  const handleCategorySelect = (category: string) => {
    if (category === 'Tất cả') {
      setActiveCategory('Tất cả');
    } else {
      setActiveCategory(category);
    }
    setCurrentView('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search submit redirects to Product List
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query && currentView === 'home') {
      setCurrentView('products');
    }
  };



  const selectedProduct = MOCK_PRODUCTS.find(p => p.id === selectedProductId) || null;

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-surface dark:bg-primary text-on-surface dark:text-inverse-on-surface transition-colors duration-300 flex flex-col justify-between">
      
      {/* Top Navigation */}
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        wishlistCount={favorites.length}
        onNavigate={handleNavigate}
        currentView={currentView}
        currentSortBy={sortBy}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Views Router */}
      <div className="flex-grow">
        {currentView === 'home' && (
          <div className="animate-fadeIn">
            {/* Banner Hero */}
            <Hero onExploreClick={() => handleNavigate('products')} />

            {/* Categories Bento Grid */}
            <Categories 
              onCategoryClick={handleCategorySelect}
              activeCategory={activeCategory}
            />

            {/* Home Best Sellers grid */}
            <section 
              className="py-[80px] px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-surface-container-low dark:bg-tertiary-container/10 rounded-3xl mb-[80px] transition-colors duration-300 scroll-mt-24"
            >
              <div className="text-center mb-12 px-4">
                <div className="inline-flex items-center gap-1.5 bg-surface-bright dark:bg-surface-container/20 text-secondary dark:text-secondary-fixed text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-outline-variant/30 mb-3 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Luxury Living
                </div>
                <h2 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim font-bold">
                  Sản Phẩm Bán Chạy
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim/60 mt-2 max-w-[600px] mx-auto leading-relaxed">
                  Những thiết kế nội thất bán chạy nhất, kết hợp hoàn hảo chất liệu gỗ tự nhiên và cơ học cao cấp.
                </p>
              </div>

              {/* Best sellers grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter px-4 md:px-0">
                {MOCK_PRODUCTS.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(prod, e) => {
                      e.stopPropagation();
                      handleAddToCart(prod);
                    }}
                    onProductClick={handleProductDetailNavigate}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>

              <div className="mt-12 text-center">
                <button 
                  onClick={() => handleNavigate('products')}
                  className="bg-transparent border border-primary dark:border-primary-fixed text-primary dark:text-primary-fixed font-semibold text-label-md px-8 py-3 rounded-lg hover:bg-surface-container-highest/60 dark:hover:bg-surface-container-low transition-colors inline-flex items-center gap-2 group shadow-sm hover:shadow"
                >
                  Xem Tất Cả Sản Phẩm 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </section>
          </div>
        )}

        {currentView === 'products' && (
          <div className="animate-fadeIn">
            <ProductList 
              products={MOCK_PRODUCTS}
              onAddToCart={(p, e) => {
                e.stopPropagation();
                handleAddToCart(p);
              }}
              onProductClick={handleProductDetailNavigate}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onNavigate={handleNavigate}
              searchQuery={searchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        )}

        {currentView === 'detail' && (
          <div className="animate-fadeIn">
            <ProductDetail 
              key={selectedProductId || 'detail'}
              product={selectedProduct}
              onAddToCart={handleAddToCart}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onNavigate={handleNavigate}
              onProductClick={handleProductDetailNavigate}
              allProducts={MOCK_PRODUCTS}
            />
          </div>
        )}

        {currentView === 'login' && (
          <div className="animate-fadeIn">
            <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
          </div>
        )}

        {currentView === 'register' && (
          <div className="animate-fadeIn">
            <RegisterPage onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'profile' && (
          <div className="animate-fadeIn">
            <ProfilePage onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Sliding Shopping Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          alert('Cảm ơn bạn đã trải nghiệm mua sắm! Đây là phiên bản demo tính năng thanh toán.');
          setCartItems([]);
          setIsCartOpen(false);
        }}
      />


    </div>
  );
}

export default App;
