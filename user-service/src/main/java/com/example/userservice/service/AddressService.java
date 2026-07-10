package com.example.userservice.service;

import com.example.userservice.entity.Address;
import com.example.userservice.entity.Province;
import com.example.userservice.entity.Ward;
import com.example.userservice.repository.AddressRepository;
import com.example.userservice.repository.ProvinceRepository;
import com.example.userservice.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final ProvinceRepository provinceRepository;
    private final WardRepository wardRepository;

    @Transactional(readOnly = true)
    public List<Address> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional
    public Address createAddress(Long userId, Address addressRequest) {
        Province province = provinceRepository.findById(addressRequest.getProvince().getCode())
                .orElseThrow(() -> new RuntimeException("Tỉnh/Thành phố không tồn tại"));

        Ward ward = wardRepository.findById(addressRequest.getWard().getCode())
                .orElseThrow(() -> new RuntimeException("Xã/Phường/Thị trấn không tồn tại"));

        if (addressRequest.isDefault()) {
            resetDefaultAddresses(userId);
        }

        Address address = Address.builder()
                .userId(userId)
                .receiverName(addressRequest.getReceiverName())
                .phoneNumber(addressRequest.getPhoneNumber())
                .addressDetail(addressRequest.getAddressDetail())
                .isDefault(addressRequest.isDefault())
                .label(addressRequest.getLabel())
                .province(province)
                .ward(ward)
                .build();

        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(Long userId, Long addressId, Address addressRequest) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        if (!address.getUserId().equals(userId)) {
            throw new RuntimeException("Không có quyền chỉnh sửa địa chỉ này");
        }

        Province province = provinceRepository.findById(addressRequest.getProvince().getCode())
                .orElseThrow(() -> new RuntimeException("Tỉnh/Thành phố không tồn tại"));

        Ward ward = wardRepository.findById(addressRequest.getWard().getCode())
                .orElseThrow(() -> new RuntimeException("Xã/Phường/Thị trấn không tồn tại"));

        if (addressRequest.isDefault()) {
            resetDefaultAddresses(userId);
        }

        address.setReceiverName(addressRequest.getReceiverName());
        address.setPhoneNumber(addressRequest.getPhoneNumber());
        address.setAddressDetail(addressRequest.getAddressDetail());
        address.setDefault(addressRequest.isDefault());
        address.setLabel(addressRequest.getLabel());
        address.setProvince(province);
        address.setWard(ward);

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        if (!address.getUserId().equals(userId)) {
            throw new RuntimeException("Không có quyền xóa địa chỉ này");
        }

        addressRepository.delete(address);
    }

    private void resetDefaultAddresses(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address addr : addresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }
    }
}
