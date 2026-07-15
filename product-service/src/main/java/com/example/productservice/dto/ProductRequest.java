package com.example.productservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @NotBlank(message = "SKU sản phẩm không được để trống")
    private String sku;

    @NotBlank(message = "Danh mục không được để trống")
    private String category;

    @NotBlank(message = "Danh mục con không được để trống")
    private String subCategory;

    @NotNull(message = "Số lượng trong kho không được để trống")
    @Min(value = 0, message = "Số lượng trong kho phải lớn hơn hoặc bằng 0")
    @Positive(message = "Số lượng không được âm")
    private Integer stock;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @Positive(message = "Giá sản phẩm phải lớn hơn 0")
    private Double price;

    @NotBlank(message = "Hình ảnh sản phẩm không được để trống")
    private String image;

    @NotBlank(message = "Mô tả sản phẩm không được để trống")
    private String description;

    private List<ProductVariantRequest> variants;
}
