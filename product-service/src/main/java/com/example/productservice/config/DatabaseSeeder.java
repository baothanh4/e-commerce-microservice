package com.example.productservice.config;

import com.example.productservice.entity.Product;
import com.example.productservice.entity.ProductVariant;
import com.example.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            Product p1 = Product.builder()
                    .name("Ghế Thư Giãn Lusso")
                    .sku("FUR-LU-001")
                    .category("Nội thất")
                    .subCategory("Phòng Khách")
                    .stock(45)
                    .price(8500000.0)
                    .image("https://lh3.googleusercontent.com/aida-public/AB6AXuBfrh-5pYCAMpA5f8DnQAwem-l6MArBTGKY60DG1oS4YuhyIjU0gbS-l-YuBZeleopO_N7v8fB1-KlRACBabgE_Alt8bfuLZcu4HVNpE0_DndSgc-lm1ZNYvY_O4LHecnFxr_W1fFquxlLzpGuNWW29fLKdTbEME9G9G2uXt7qr_2T-sGsoM8N8Dg8CDRdCFiYpeQOvPRQJc_aTyAWR3EWL0642V2mjbk5-sVouzkesg6ihuQVhVMzcsO7_pApEeX6nB2AAsDOBiQ")
                    .description("Ghế thư giãn Lusso mang lại nét sang trọng cho mọi không gian với đệm nhung êm ái.")
                    .createdAt(java.time.LocalDateTime.now().minusDays(10))
                    .build();

            p1.getVariants().addAll(Arrays.asList(
                ProductVariant.builder().product(p1).sku("FUR-LU-001-NV-DL").color("Classic Navy").size("Deluxe").price(9000000.0).stock(10).build(),
                ProductVariant.builder().product(p1).sku("FUR-LU-001-NV-ST").color("Classic Navy").size("Standard").price(8500000.0).stock(15).build(),
                ProductVariant.builder().product(p1).sku("FUR-LU-001-NV-CP").color("Classic Navy").size("Compact").price(8000000.0).stock(20).build(),
                ProductVariant.builder().product(p1).sku("FUR-LU-001-BK-DL").color("Matte Black").size("Deluxe").price(9200000.0).stock(8).build(),
                ProductVariant.builder().product(p1).sku("FUR-LU-001-BK-ST").color("Matte Black").size("Standard").price(8700000.0).stock(12).build(),
                ProductVariant.builder().product(p1).sku("FUR-LU-001-BK-CP").color("Matte Black").size("Compact").price(8200000.0).stock(15).build()
            ));

            Product p2 = Product.builder()
                    .name("Bàn Trà Gỗ Sồi Oaka")
                    .sku("FUR-OA-002")
                    .category("Nội thất")
                    .subCategory("Phòng Khách")
                    .stock(12)
                    .price(5900000.0)
                    .image("https://lh3.googleusercontent.com/aida-public/AB6AXuDTwnGbduEbK4lrBhGO4OsZDWK5VtI1ikZA-6M9hxleOcq8fp_2e_MIFC_z9hzpr7S0ufa5RHFnqT3U_S2KodyECRXTBH25zsRxaIAl-wD0qpwnK1CWa3W_fM5ncT3hSV_C1Hr_s6oJnS_dSR_62fmwA3w8drpAHqnLoTpVsRqGBwf4w2OeaX2l59nYyLYp0oRT-LoYYE2HXcnJbAXhiACXakYTf7s857GtPszO1Lqx8fGGgkM-3Nw3krg94SQ3V3krthKH1mTBKQ")
                    .description("Bàn trà Oaka làm từ gỗ sồi tuyển chọn kỹ lưỡng, vân gỗ tự nhiên sắc nét.")
                    .createdAt(java.time.LocalDateTime.now().minusDays(10))
                    .build();

            p2.getVariants().addAll(Arrays.asList(
                ProductVariant.builder().product(p2).sku("FUR-OA-002-OAK-CP").color("Natural Oak").size("Compact").price(5500000.0).stock(5).build(),
                ProductVariant.builder().product(p2).sku("FUR-OA-002-OAK-ST").color("Natural Oak").size("Standard").price(5900000.0).stock(7).build()
            ));

            Product p3 = Product.builder()
                    .name("Sofa Da Bò Minimalist")
                    .sku("FUR-SO-003")
                    .category("Nội thất")
                    .subCategory("Phòng Khách")
                    .stock(8)
                    .price(42000000.0)
                    .image("https://lh3.googleusercontent.com/aida-public/AB6AXuAc_NLLgeQi4KRnn31YHOuYJDD_D0pTWhujLu4e5fQtYwLiVznYLd2udhXb_FTCVU8Fm1tVI2bNLRy24LXM0ih-eF4EIfAvyTjOq_pM48wCG5iY7EUGtbGWWsA_cBSnx_sNNGeTHR2EG-fDTp1g6ZWtuH7-grqV0St2km6RUvMlNyH6hlXGrkK7ITiAzjKV2mO395CYOXDEM7jpMKSbdaN5JqS8Jp92MeGdHzErIUkBqw4kc0V8LXK9JnQc13mNHVgn82YMRgFgOA")
                    .description("Sofa da bò cao cấp tối giản mang đến không gian phòng khách hiện đại.")
                    .createdAt(java.time.LocalDateTime.now().minusDays(10))
                    .build();

            p3.getVariants().addAll(Arrays.asList(
                ProductVariant.builder().product(p3).sku("FUR-SO-003-BR-ST").color("Tan Brown").size("Standard").price(42000000.0).stock(4).build(),
                ProductVariant.builder().product(p3).sku("FUR-SO-003-BK-ST").color("Charcoal Black").size("Standard").price(42000000.0).stock(4).build()
            ));

            Product p4 = Product.builder()
                    .name("Đèn Đứng Nova Brass")
                    .sku("DEC-NO-004")
                    .category("Đồ trang trí")
                    .subCategory("Đồ Trang Trí")
                    .stock(15)
                    .price(3200000.0)
                    .image("https://lh3.googleusercontent.com/aida-public/AB6AXuAgju5KWp1okl1BuFV9zyXORLeCytWwb3gNtd4T4Hk6WxbEGdEvm9XYbcReHCUU-2Pyl3dHwbTPHLtzF93zZtU2SJEfuIw_C5Kjf0dD17mlAVRrYCgUm3UHxFY4kQSFuNROH88mVGI9zD7C-iBWjP1o4fEfXqAXl9xt57fZrzvg8PaVqiSw3t0utO6YN18SjVCoazlZDGkhE5mldk5GHkWpKQpZangc23Q1yO4OszrUcyRiKTejG-y_kEI8u1PQVZwM2-1c2Nf2hQ")
                    .description("Đèn Nova Brass toát lên vẻ cổ điển pha trộn hiện đại, kết cấu vững chãi từ đồng nguyên khối.")
                    .createdAt(java.time.LocalDateTime.now().minusDays(10))
                    .build();

            Product p5 = Product.builder()
                    .name("Giường Bọc Nỉ Gray Lusso")
                    .sku("FUR-GL-005")
                    .category("Nội thất")
                    .subCategory("Phòng Ngủ")
                    .stock(5)
                    .price(24500000.0)
                    .image("https://lh3.googleusercontent.com/aida-public/AB6AXuAqb6HaIhqYSFINioZgapMiKzDkwxsCinNl0TojZGkQwQbJkTIV9IhmdEEr9UeTw5iS6o8Ycqdnnhmj7kQRAfZgjHBBD9MwK_CV_5o8nM51u-wmDD7X4VDbEJUNqGrdzKoJXP_BEDCDjczYhp1CcN5dVpM3-yPl7dmWIryFGRXSmYwHbGrvlmZrVLRDLI4mvIe8hoJlRzirpUae10S4WsL5O-cF77Z8eLl6jFUrWJcf-Wl0eI0wgz7emZ9MbeytROLIz56uytpPvA")
                    .description("Giường ngủ Lusso Gray sở hữu đầu giường bọc nỉ xám thời thượng mang lại giấc ngủ êm ái.")
                    .build();

            Product p6 = Product.builder()
                    .name("Bộ Bàn Ăn Gỗ Walnut")
                    .sku("FUR-WA-006")
                    .category("Nội thất")
                    .subCategory("Bàn Ghế Ăn")
                    .stock(10)
                    .price(18200000.0)
                    .image("https://lh3.googleusercontent.com/aida-public/AB6AXuDCL68nTTiEgfC0ocTEDEbvx17h00UWYfPI-5kwOAHVOgmlz2uZ85SpL8SDnNbCFIDlfvL1ZewrBL6xtok6NPLe3_Oj5GXH46zQeP5ZydJEqUK08vn2dEE2WxtUFIhsn_ccU8kgRiA7R03dH6vHnXyonieNSmDCDpjUUhaYJDuje8Y1hBFphvPLraamS2VDsRA0G-1gcS-qCuxFRvp_hn8Xy8vjr1kWBSgogJBai97vAVRz3vUMJi11AkVFnzSQhPPMYaFSU0j47Q")
                    .description("Bộ bàn ăn Walnut kết hợp giữa bàn gỗ óc chó cao cấp và 4 ghế tựa êm ái.")
                    .build();

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6));
        }
    }
}
