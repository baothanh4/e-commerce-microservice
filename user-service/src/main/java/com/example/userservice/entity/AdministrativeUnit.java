package com.example.userservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "administrative_units")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdministrativeUnit {

    @Id
    private Integer id;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "full_name_en")
    private String fullNameEn;

    @Column(name = "short_name")
    private String shortName;

    @Column(name = "short_name_en")
    private String shortNameEn;

    @Column(name = "code_name")
    private String codeName;

    @Column(name = "code_name_en")
    private String codeNameEn;
}
