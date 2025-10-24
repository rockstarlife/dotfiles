function mount-notes
    # Проверяем, не смонтирована ли директория
    if mount | grep -q /home/neo/Private
        echo "Директория ~/Private уже смонтирована"
        return 1
    end

    # Запрашиваем пароль шифрования безопасно
    echo "Введите пароль шифрования (20 символов): "
    read -s passphrase

    # Добавляем ключ шифрования
    set sig (echo $passphrase | ecryptfs-add-passphrase - | grep -o "[a-f0-9]\{16\}")

    # Проверяем, получена ли сигнатура
    if test -z "$sig"
        echo "Ошибка: не удалось добавить ключ шифрования. Проверьте пароль."
        return 1
    end

    # Монтируем директорию
    sudo mount -t ecryptfs /home/neo/.Private /home/neo/Private \
        -o key=passphrase:passphrase_passwd=$passphrase,ecryptfs_cipher=aes,ecryptfs_key_bytes=32,ecryptfs_passthrough=n,ecryptfs_enable_filename_crypto=y

    # Проверяем успешность монтирования
    if mount | grep -q /home/neo/Private
        echo "Директория ~/Private успешно смонтирована"
    else
        echo "Ошибка монтирования. Проверьте пароль или конфигурацию."
        return 1
    end
end
