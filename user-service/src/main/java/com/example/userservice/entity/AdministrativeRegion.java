package com.example.userservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "administrative_regions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdministrativeRegion {

    @Id
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "code_name")
    private String codeName;

    @Column(name = "code_name_en")
    private String codeNameEn;
}
