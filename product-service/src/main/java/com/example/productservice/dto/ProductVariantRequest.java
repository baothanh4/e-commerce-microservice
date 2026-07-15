package com.example.productservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantRequest {
    private String sku;
    private String color;
    private String size;
    private Double price;
    private Integer stock;
    private String image;
}
