package com.example.productservice.config;

import com.example.productservice.entity.Product;
import com.example.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            List<Product> defaultProducts = Arrays.asList(
                Product.builder()
                    .name("Ghế Thư Giãn Lusso")
                    .sku("FUR-LU-001")
                    .category("Nội thất")
                    .stock(45)
                    .price(8500000.0)
                    .image("https://lh3.googleusercontent.com/aida-public/AB6AXuBfrh-5pYCAMpA5f8DnQAwem-l6MArBTGKY60DG1oS4YuhyIjU0gbS-l-YuBZeleopO_N7v8fB1-KlRACBabgE_Alt8bfuLZcu4HVNpE0_DndSgc-lm1ZNYvY_O4LHecnFxr_W1fFquxlLzpGuNWW29fLKdTbEME9G9G2uXt7qr_2T-sGsoM8N8Dg8CDRdCFiYpeQOvPRQJc_aTyAWR3EWL0642V2mjbk5-sVouzkesg6ihuQVhVMzcsO7_pApEeX6nB2AAsDOBiQ")
                    .description("Ghế thư giãn Lusso mang lại nét sang trọng cho mọi không gian với đệm nhung êm ái.")
                    .build(),
                Product.builder()
                    .name("Bàn Trà Gỗ Sồi Oaka")
                    .sku("FUR-OA-002")
                    .category("Nội thất")
                    .stock(12)
                    .price(5900000.0)
                    .image("https://lh3.googleusercontent.com/aida-public/AB6AXuDTwnGbduEbK4lrBhGO4OsZDWK5VtI1ikZA-6M9hxleOcq8fp_2e_MIFC_z9hzpr7S0ufa5RHFnqT3U_S2KodyECRXTBH25zsRxaIAl-wD0qpwnK1CWa3W_fM5ncT3hSV_C1Hr_s6oJnS_dSR_62fmwA3w8drpAHqnLoTpVsRqGBwf4w2OeaX2l59nYyLYp0oRT-LoYYE2HXcnJbAXhiACXakYTf7s857GtPszO1Lqx8fGGgkM-3Nw3krg94SQ3V3krthKH1mTBKQ")
                    .description("Bàn trà Oaka làm từ gỗ sồi tuyển chọn kỹ lưỡng, vân gỗ tự nhiên sắc nét.")
                    .build(),
                Product.builder()
                    .name("Sofa Da Bò Minimalist")
                    .sku("FUR-SO-003")
                    .category("Nội thất")
                    .stock(8)
                    .price(42000000.0)
                    .image("https://lh3.googleusercontent.com/aida-public/AB6AXuAc_NLLgeQi4KRnn31YHOuYJDD_D0pTWhujLu4e5fQtYwLiVznYLd2udhXb_FTCVU8Fm1tVI2bNLRy24LXM0ih-eF4EIfAvyTjOq_pM48wCG5iY7EUGtbGWWsA_cBSnx_sNNGeTHR2EG-fDTp1g6ZWtuH7-grqV0St2km6RUvMlNyH6hlXGrkK7ITiAzjKV2mO395CYOXDEM7jpMKSbdaN5JqS8Jp92MeGdHzErIUkBqw4kc0V8LXK9JnQc13mNHVgn82YMRgFgOA")
                    .description("Sofa da bò cao cấp tối giản mang đến không gian phòng khách hiện đại.")
                    .build(),
                Product.builder()
                    .name("Đèn Đứng Nova Brass")
                    .sku("DEC-NO-004")
                    .category("Đồ trang trí")
                    .stock(15)
                    .price(3200000.0)
                    .image("https://lh3.googleusercontent.com/aida-public/AB6AXuAgju5KWp1okl1BuFV9zyXORLeCytWwb3gNtd4T4Hk6WxbEGdEvm9XYbcReHCUU-2Pyl3dHwbTPHLtzF93zZtU2SJEfuIw_C5Kjf0dD17mlAVRrYCgUm3UHxFY4kQSFuNROH88mVGI9zD7C-iBWjP1o4fEfXqAXl9xt57fZrzvg8PaVqiSw3t0utO6YN18SjVCoazlZDGkhE5mldk5GHkWpKQpZangc23Q1yO4OszrUcyRiKTejG-y_kEI8u1PQVZwM2-1c2Nf2hQ")
                    .description("Đèn Nova Brass toát lên vẻ cổ điển pha trộn hiện đại, kết cấu vững chãi từ đồng nguyên khối.")
                    .build()
            );
            productRepository.saveAll(defaultProducts);
        }
    }
}
